(function ($) {
  $(document).ready(function () {
    // Control panel URL for moving and choosing composition.
    // It's pulled by ajax and included after </body> tag so it can
    // be set under the page.
    var compositionControlPanel = Drupal.settings.basePath + 'admin/settings/perfecto/composition_control_panel';

    // Cache body tag
    var $body = $('body');

    var blinkTimer;

    /**
     * Turn true and false strings to boolean.
     *
     * $.cookie returns always strings.
     */
    parseBoolean = function (str) {
      switch (str.toLowerCase()) {
        case 'true':
          return true;

        case 'false':
          return false;

        default:
          throw new Error ("parseBoolean: cannot convert string to boolean.");
      }
    };

    // Init perfecto and pull in control panel
    $.ajax({
      url: compositionControlPanel,
      success: function (data) {
        $(data).insertAfter($body);
        initPerfecto();
      }
    });

    // Rest of the code.
    var initPerfecto = function () {
      // Define variables, cache dom objects
      var
      mouseX,
      mouseY,
      composition,
      $compositionControls = $('#perfecto__imagecompositioncontrols'),
      $compositionControlsLinkToCPanel = $('a#perfecto__imagecompositioncontrols-link_to_controlpanel'),
      $compositionControlsMouseHook = $('#perfecto__imagecompositioncontrols_mousehook'),
      $compositionControlsWrap = $('#perfecto__imagecompositioncontrols_wrap'),
      $compositionControlsXMoverInput = $('#perfecto__imagecompositioncontrols-xmover-input'),
      $compositionControlsYMoverInput = $('#perfecto__imagecompositioncontrols-ymover-input'),
      $compositionControlsFileselect = $('#perfecto__imagecompositioncontrols-files'),
      compositionOpacityDefaultValue = 0.4,
      compositionOpacity = $.cookie('perfecto__imagecompositioncontrols_opacity') ? parseFloat($.cookie('perfecto__imagecompositioncontrols_opacity')) : compositionOpacityDefaultValue,
      $compositionOpacitySlider = $('div#perfecto__imagecompositioncontrols-opacity-slider'),
      compositionPositionX = $.cookie('perfecto__composition_position_x') ? parseInt($.cookie('perfecto__composition_position_x')) : 0,
      compositionPositionY = $.cookie('perfecto__composition_position_y') ? parseInt($.cookie('perfecto__composition_position_y')) : 0,
      compositionFilename = $.cookie('perfecto__composition_filename') ? $.cookie('perfecto__composition_filename') : $compositionControlsFileselect.find('option:first').val(),
      lock = $.cookie('perfecto__composition_lock') ? parseBoolean($.cookie('perfecto__composition_lock')) : false,
      dragging = false,
      // Starting position of mouse x when starting to drag.
      dragStartX,
      // Starting position of mouse y when starting to drag.
      dragStartY,
      compositionVisible = $.cookie('perfecto__imagecompositioncontrols_visible') ? parseBoolean($.cookie('perfecto__imagecompositioncontrols_visible')) : false,
      move10px = false,
      compositionUrl,
      $draggableHandle,
      compositionMoverJQuerySelector
      $html = $('html'),
      blinking = false;

      // Add mousemove event for registering mouse coordinates.
      $(document).mousemove(function (e) {
          mouseX = e.pageX;
          mouseY = e.pageY;
      });

      // Add change event to composition select tag (list all compositions).
      $compositionControlsFileselect.change(function () {
        compositionFilename = $(this).find('option:selected').val();
        compositionUrl = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/' + compositionFilename;
        composition.attr('src', compositionUrl);
        $.cookie('perfecto__composition_filename', compositionFilename);
        compositionEnable();
      });

      // Add slider event to opacity control.
      $compositionOpacitySlider
        .slider({
          value   : compositionOpacity,
          min     : 0,
          max     : 1,
          step    : 0.1,
          slide:  function (event, ui) {
            if (compositionVisible === false) {
              compositionEnable();
            }

            $body.css({
              'opacity': ui.value
            });
            $.cookie('perfecto__imagecompositioncontrols_opacity', ui.value);
          }
        });

      // Add click event to reset checkbox.
      // Reset moves composition to top left corner of the browser
      // and defaults opacity.
      $('a#perfecto__imagecompositioncontrols_reset').click(function () {
        compositionPositionX = compositionPositionY = 0;
        $.cookie('perfecto__composition_position_x', compositionPositionX);
        $.cookie('perfecto__composition_position_y', compositionPositionY);
        composition.css({
          'left'    : compositionPositionX,
          'top'     : compositionPositionY
        });

        // Opacity
        $compositionOpacitySlider.slider('value', compositionOpacityDefaultValue);
        $.cookie('perfecto__imagecompositioncontrols_opacity', compositionOpacityDefaultValue);
        $body.css({
          'opacity': compositionOpacityDefaultValue
        });

        // Change coordinates in textinput.
        $compositionControlsXMoverInput.val(compositionPositionX);
        $compositionControlsYMoverInput.val(compositionPositionY);
      });

      $('input#perfecto__imagecompositioncontrols-lock').click(function (e) {
        if (this.checked) {
          lock = true;
        }
        else {
          lock = false;
        }
        $.cookie('perfecto__composition_lock', lock)
      });

      // Set composition url. Set to trans.gif if it does not exist.
      if ($compositionControlsFileselect.find('option').length === 0) {
        compositionUrl = Drupal.settings.perfecto.path + '/images/trans.gif';
      }
      else if ($compositionControlsFileselect.find('option[value=' + compositionFilename + ']').length === 0) {
        compositionUrl = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/' + $compositionControlsFileselect.find('option:first').val();
      }
      else {
        compositionUrl = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/' + compositionFilename;
      }

      // Create image tag that we use to display the composition.
      composition = $('<img id="perfecto__imagecompositioncontrols_img" src="' + compositionUrl + '" alt="" />');

      // Set styles for composition image and add it to DOM.
      composition
        .css({
          'position': 'absolute',
          'z-index' : -99999,
          'left'    : compositionPositionX + 'px',
          'top'     : compositionPositionY + 'px',
          'display' : compositionVisible === true ? 'block' : 'none'
        })
        .insertAfter($body);

      // Check if composition should be visible or not and act accordingly.
      if (compositionVisible === true) {
        $body.css({
          'opacity': compositionOpacity
        });
      }

      // Create block that allows moving the composition.
      // This block is invisible, follows mouse and positions itself under the
      // cursor when ctrl is pressed. If ctrl + mouse left button is down,
      // composition start to move. Note that this way mouse does not have to be
      // on the composition.
      $draggableHandle = $('<div id="perfecto_draggable_handle"></div>');

      // chrome fix
      $draggableHandle.css('position', 'absolute');

      // Make composition draggable.
      // Here we actually make the #perfecto_draggable_handle div draggable and
      // change compositions coordinates relative to starting point of drag.
      $draggableHandle
        .draggable({
          start: function (e, ui) {
            dragging = true;

            dragStartX = ui.position.left;
            dragStartY = ui.position.top;
            compositionPositionStartX = compositionPositionX;
            compositionPositionStartY = compositionPositionY;
          },
          stop: function (e, ui) {
            dragging = false;

            $.cookie('perfecto__composition_position_x', compositionPositionX);
            $.cookie('perfecto__composition_position_y', compositionPositionY);
          },
          drag: function (e, ui) {
            if (lock || !e.ctrlKey) {
                return false;
            }

            var dragCurrentX = ui.position.left;
            var dragCurrentY = ui.position.top;
            compositionPositionX = compositionPositionStartX + dragCurrentX - dragStartX;
            compositionPositionY = compositionPositionStartY + dragCurrentY - dragStartY;

            composition.css({
                'left': compositionPositionX,
                'top': compositionPositionY
            });

            // Change coordinates in textinput.
            $compositionControlsXMoverInput.val(compositionPositionX);
            $compositionControlsYMoverInput.val(compositionPositionY);
          }
        })
        .insertAfter($body);

      // Don't allow text selection in control panel. It's ugly.
      $('#perfecto__imagecompositioncontrols').disableSelection();

      $('#perfecto__imagecompositioncontrols_toggle').click(function () {
          if (compositionVisible === true) {
            compositionDisable();
          }
          else {
            compositionEnable();
          }
          $(this).blur();
      });

      var compositionEnable = function () {
        $body.css({
            'opacity': compositionOpacity
        });
        compositionVisible = true;
        $.cookie('perfecto__imagecompositioncontrols_visible', compositionVisible);
        $('#perfecto__imagecompositioncontrols_img').show();
      }

      var compositionDisable = function () {
        $body.css({
          'opacity': 1
        });
        compositionVisible = false;
        $.cookie('perfecto__imagecompositioncontrols_visible', compositionVisible);
        $('#perfecto__imagecompositioncontrols_img').hide();
      }

      $(document).keyup(function (e) {
        e.preventDefault();
        var step;

        // Don't allow movement when locked
        // or using Stylizer ( http://www.stylizerapp.com/ ).
        // It's annoying when Stylizer does it's own
        // thing when ctrl+arrow is pressed so let's just disable this feature.
        if (lock || $html.hasClass('stylizer-preview-on')) {
          return false;
        }

        if (e.ctrlKey) {
          if (e.shiftKey) {
            step = 10;
          }
          else {
            step = 1;
          }

          // up
          if (e.keyCode == 38) {
            compositionPositionY -= step;
          }
          // down
          else if (e.keyCode == 40) {
            compositionPositionY += step;
          }
          // left
          else if (e.keyCode == 37) {
            compositionPositionX -= step;
          }
          // right
          else if (e.keyCode == 39) {
            compositionPositionX += step;
          }

          // up or down
          if (e.keyCode == 38 || e.keyCode == 40) {
            composition.css({
              'top': compositionPositionY
            });
          }
          else if (e.keyCode == 37 || e.keyCode == 39) {
            composition.css({
              'left': compositionPositionX
            });
          }
          return false;
        }
      });

      // Start dragger.
      // 50x50 div will moved under cursor when ctrl key is held down.
      // Firefox can't move it fast enough but at normal mouse
      // speeds it's okay.
      // Also when ctrl+shift key is pressed and composition is moved with
      // keyboard or control panel arrow keys,
      // composition moves by 10px (not 1px).
      $(window).keydown(function (e) {
        if (e.ctrlKey && !dragging && compositionVisible === true) {
          $draggableHandle.css({
            'display': 'block',
            'left'   : mouseX - 25,
            'top'    : mouseY - 25
          });
        }
        if (e.shiftKey) {
          move10px = true;
        }
      });

      // Disable dragging when any key press has ended.
      $(window).keyup(function (e) {
        $draggableHandle.css({
          'display': 'none'
        });
        move10px = false;
      });

      // Add click event to arrow buttons.
      // Move composition by clicking on
      // top, down, left and right arrows in control panel.
      $('#perfecto__xmover-left, #perfecto__xmover-right, ' +
        '#perfecto__ymover-down, #perfecto__ymover-up').click(function (e) {
        if (compositionVisible === false) {
          compositionEnable();
        }

        if (lock) {
            return false;
        }

        var
          compositionPositionX = $.cookie('perfecto__composition_position_x') * 1.0,
          compositionPositionY = $.cookie('perfecto__composition_position_y') * 1.0,
          movestep;

        if (move10px) {
          movestep = 10;
        }
        else {
          movestep = 1;
        }

        if (this.id == 'perfecto__xmover-left') {
          compositionPositionX = compositionPositionX - movestep;
          $compositionControlsXMoverInput.val(compositionPositionX);
        }
        else if (this.id == 'perfecto__xmover-right') {
          compositionPositionX = compositionPositionX + movestep;
          $compositionControlsXMoverInput.val(compositionPositionX);
        }
        else if (this.id == 'perfecto__ymover-up') {
          compositionPositionY = compositionPositionY - movestep;
          $compositionControlsYMoverInput.val(compositionPositionY);
        }
        else if (this.id == 'perfecto__ymover-down') {
          compositionPositionY = compositionPositionY + movestep;
          $compositionControlsYMoverInput.val(compositionPositionY);
        }
        composition.css({
          'left': compositionPositionX,
          'top': compositionPositionY
        });
        $.cookie('perfecto__composition_position_x', compositionPositionX);
        $.cookie('perfecto__composition_position_y', compositionPositionY);
      });

      // Make control panel visible when
      // moving mouse to top right corner of viewport.
      $compositionControlsWrap.bind({
        mouseenter: function () {
          if (blinking) {
            disableBlinking($compositionControlsMouseHook);
          }

          $compositionControls.css({
              'display': 'block'
          });
        },
        mouseleave: function () {
          if (compositionVisible !== true) {
              $compositionControls.css({
                  'display': 'none'
              });
          }
        }
      });

      // Used to highlight top right corner of viewport.
      var enableBlinking = function ($el) {
        var originalBg = $el.css('background');
        blinking = true;

        var _enableBlinking = function ($el, originalBg) {
          if ($el.hasClass('blink-on')) {
            $el.attr('style', '');
            $el.removeClass('blink-on');
          } else {
            $el.css('background', 'red');
            $el.addClass('blink-on');
          }
        }

        blinkTimer = setInterval(function(){_enableBlinking($el, originalBg);},500);
      }

      // Used conjunction with enableBlinking().
      var disableBlinking = function ($el) {
        clearTimeout(blinkTimer);
        $el.attr('style', '');
        $el.removeClass('blink-on');
        blinking = false;
      }

      if (Drupal.settings.perfecto.firstUploadEver) {
        enableBlinking($compositionControlsMouseHook);
      }

      $compositionControlsLinkToCPanel.click(function () {
        compositionDisable();
        document.location = this.href;
        return false;
      });
    }
  });
})(jQuery);
