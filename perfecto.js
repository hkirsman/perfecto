(function ($) {
  Drupal.behaviors.initPerfecto = {
    attach: function (context) {
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

      // Control panel URL for moving and choosing composition.
      // It's pulled by ajax and included after </body> tag so it can
      // be set under the page.
      var compositionControlPanel = Drupal.settings.basePath + '?q=admin/settings/perfecto/composition_control_panel';
      var behind_page = $.cookie('perfecto_behind_page') ? parseBoolean($.cookie('perfecto_behind_page')) : true;
      // Set scope for setOverlayToFrontOfPage() and setOverlayToBehindOfPage().
      var setOverlayToFrontOfPage, setOverlayToBehindOfPage;

      // Cache body tag.
      var $body = $('body');

      var blinkTimer;

      // Init perfecto and pull in control panel.
      $.ajax({
        url: compositionControlPanel,
        success: function (data) {
          $(data).insertAfter($body);

          initPerfecto();

          if (behind_page) {
            setOverlayToBehindOfPage();
          } else {
            setOverlayToFrontOfPage();
          }
        }
      });

      // Rest of the code.
      var initPerfecto = function () {
        // Define variables, cache dom objects.
        var
        mouseX,
        mouseY,
        composition,
        $compositions = $('.perfecto-imagecompositioncontrols-img'),
        $compositionControls = $('#perfecto-imagecompositioncontrols'),
        $compositionControlsLinkToCPanel = $('a#perfecto-imagecompositioncontrols-link-to-controlpanel'),
        $compositionControlsMouseHook = $('#perfecto-imagecompositioncontrols-mousehook'),
        $compositionControlsWrap = $('#perfecto-imagecompositioncontrols-wrap'),
        $compositionControlsXMoverInput = $('#perfecto-imagecompositioncontrols-xmover-input'),
        $compositionControlsYMoverInput = $('#perfecto-imagecompositioncontrols-ymover-input'),
        $compositionControlsFileselect = $('#perfecto-imagecompositioncontrols-files'),
        compositionOpacityDefaultValue = 0.4,
        compositionOpacity = $.cookie('perfecto_imagecompositioncontrols_opacity') ? parseFloat($.cookie('perfecto_imagecompositioncontrols_opacity')) : compositionOpacityDefaultValue,
        $compositionOpacitySlider = $('div#perfecto-imagecompositioncontrols-opacity-slider'),
        compositionPositionX = $.cookie('perfecto_composition_position_x') ? parseInt($.cookie('perfecto_composition_position_x')) : 0,
        compositionPositionY = $.cookie('perfecto_composition_position_y') ? parseInt($.cookie('perfecto_composition_position_y')) : 0,
        compositionFirstShow = $.cookie('perfecto_composition_first_show') ? parseBoolean($.cookie('perfecto_composition_first_show')) : true,
        compositionId = $.cookie('perfecto_composition_id') ? $.cookie('perfecto_composition_id') : $compositionControlsFileselect.find('option:first').val(),
        lock = $.cookie('perfecto_composition_lock') ? parseBoolean($.cookie('perfecto_composition_lock')) : false,
        dragging = false,
        // Starting position of mouse x when starting to drag.
        dragStartX,
        // Starting position of mouse y when starting to drag.
        dragStartY,
        compositionVisible = $.cookie('perfecto_imagecompositioncontrols_visible') ? parseBoolean($.cookie('perfecto_imagecompositioncontrols_visible')) : false,
        move10px = false,
        $draggableHandle,
        compositionMoverJQuerySelector
        $html = $('html'),
        blinking = false;

        // Set cookies.
        $.cookie('perfecto_imagecompositioncontrols_opacity', compositionOpacity, {path: Drupal.settings.basePath});
        $.cookie('perfecto_composition_position_x', compositionPositionX, {path: Drupal.settings.basePath});
        $.cookie('perfecto_composition_position_y', compositionPositionY, {path: Drupal.settings.basePath});
        $.cookie('perfecto_composition_first_show', compositionFirstShow, {path: Drupal.settings.basePath});
        $.cookie('perfecto_composition_id', compositionId, {path: Drupal.settings.basePath});
        $.cookie('perfecto_behind_page', behind_page, {path: Drupal.settings.basePath});
        $.cookie('perfecto_composition_lock', lock, {path: Drupal.settings.basePath});

        // Add mousemove event for registering mouse coordinates.
        $(document).mousemove(function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        });

        // Create image tag that we use to display the composition.
        composition = $('#' + compositionId);

        // Move composition to top center of the screen.
        var setCompositionPositionCenter = function () {
          var docwith = $(document).width();
          compositionPositionX = parseInt((docwith - composition.width()) / 2);
          compositionPositionY = 0;
          $.cookie('perfecto_composition_position_x', compositionPositionX, {path: Drupal.settings.basePath});
          $.cookie('perfecto_composition_position_y', compositionPositionY, {path: Drupal.settings.basePath});
          composition
            .css({
              'left': compositionPositionX,
              'top': compositionPositionY
            });
        }

        $compositionControlsXMoverInput.val(compositionPositionX);
        $compositionControlsYMoverInput.val(compositionPositionY);

        // Add change event to composition select tag (list all compositions).
        $compositionControlsFileselect.change(function () {
          compositionId = $(this).find('option:selected').val();
          $.cookie('perfecto_composition_id', compositionId, {path: Drupal.settings.basePath});
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

              if (behind_page) {
                $body.css('opacity', ui.value);
              } else {
                composition.css('opacity', ui.value);
              }
              $.cookie('perfecto_imagecompositioncontrols_opacity', ui.value, {path: Drupal.settings.basePath});
            }
          });

        // Add click event to reset checkbox.
        // Reset moves composition to top left corner of the browser
        // and defaults opacity.
        $('a#perfecto-imagecompositioncontrols-reset').click(function () {
          if (compositionVisible === true) {
            setCompositionPositionCenter();

            // Opacity.
            $compositionOpacitySlider.slider('value', compositionOpacityDefaultValue);
            $.cookie('perfecto_imagecompositioncontrols_opacity', compositionOpacityDefaultValue, {path: Drupal.settings.basePath});
            $body.css({
              'opacity': compositionOpacityDefaultValue
            });

            // Change coordinates in textinput.
            $compositionControlsXMoverInput.val(compositionPositionX);
            $compositionControlsYMoverInput.val(compositionPositionY);
          }
        });

        // Add click event to minimize button.
        // Minimize hides the admin panel.
        $('a#perfecto-imagecompositioncontrols-minimize').click(function () {
          $compositionControls.css({
            'display': 'none'
          });
        });

        $('input#perfecto-imagecompositioncontrols-behind-page').click(function (e) {
          if (compositionVisible === false) {
            compositionEnable();
          }

          if (this.checked) {
            behind_page = true;
            setOverlayToBehindOfPage();
          }
          else {
            behind_page = false;
            setOverlayToFrontOfPage();
          }
          $.cookie('perfecto_behind_page', behind_page, {path: Drupal.settings.basePath})
        });

        $('input#perfecto-imagecompositioncontrols-lock').click(function (e) {
          if (this.checked) {
            lock = true;
          }
          else {
            lock = false;
          }
          $.cookie('perfecto_composition_lock', lock, {path: Drupal.settings.basePath})
        });

        // Set styles for composition image and add it to DOM.
        composition
          .css({
            'left'    : compositionPositionX + 'px',
            'top'     : compositionPositionY + 'px',
            'display' : compositionVisible === true ? 'block' : 'none'
          });

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
        $draggableHandle = $('<div id="perfecto-draggable-handle"></div>');

        // Chrome fix.
        $draggableHandle.css('position', 'absolute');

        // Make composition draggable.
        // Here we actually make the #perfecto-draggable-handle div draggable and
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

              $.cookie('perfecto_composition_position_x', compositionPositionX, {path: Drupal.settings.basePath});
              $.cookie('perfecto_composition_position_y', compositionPositionY, {path: Drupal.settings.basePath});
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

        $('#perfecto-imagecompositioncontrols-toggle').click(function () {
            if (compositionVisible === true) {
              compositionDisable();
            }
            else {
              compositionEnable();
            }
            $(this).blur();
        });

        var compositionEnable = function () {
          if (compositionFirstShow) {
            setCompositionPositionCenter();
            compositionFirstShow = false;
            $.cookie('perfecto_composition_first_show', compositionFirstShow, {path: Drupal.settings.basePath});
          }

          if (behind_page) {
            $body.css('opacity', compositionOpacity);
          } else {
            $body.css('opacity', 1);
          }

          compositionVisible = true;
          $.cookie('perfecto_imagecompositioncontrols_visible', compositionVisible, {path: Drupal.settings.basePath});
          compositionsDisableAll();
          composition = $('#' + compositionId);
          composition
            .css({
              'left': compositionPositionX,
              'top': compositionPositionY
            })
            .show();
        }

        var compositionDisable = function () {
          $body.css({
            'opacity': 1
          });
          compositionVisible = false;
          $.cookie('perfecto_imagecompositioncontrols_visible', compositionVisible, {path: Drupal.settings.basePath});
          composition.hide();
        }

        var compositionsDisableAll = function () {
          $compositions.hide();
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

            // Up.
            if (e.keyCode == 38) {
              compositionPositionY -= step;
            }
            // Down.
            else if (e.keyCode == 40) {
              compositionPositionY += step;
            }
            // Left.
            else if (e.keyCode == 37) {
              compositionPositionX -= step;
            }
            // Right.
            else if (e.keyCode == 39) {
              compositionPositionX += step;
            }

            // Up or down.
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
        $('#perfecto-xmover-left, #perfecto-xmover-right, ' +
          '#perfecto-ymover-down, #perfecto-ymover-up').click(function (e) {
          if (compositionVisible === false) {
            compositionEnable();
          }

          if (lock) {
              return false;
          }

          var
            compositionPositionX = $.cookie('perfecto_composition_position_x') * 1.0,
            compositionPositionY = $.cookie('perfecto_composition_position_y') * 1.0,
            movestep;

          if (move10px) {
            movestep = 10;
          }
          else {
            movestep = 1;
          }

          if (this.id == 'perfecto-xmover-left') {
            compositionPositionX = compositionPositionX - movestep;
            $compositionControlsXMoverInput.val(compositionPositionX);
          }
          else if (this.id == 'perfecto-xmover-right') {
            compositionPositionX = compositionPositionX + movestep;
            $compositionControlsXMoverInput.val(compositionPositionX);
          }
          else if (this.id == 'perfecto-ymover-up') {
            compositionPositionY = compositionPositionY - movestep;
            $compositionControlsYMoverInput.val(compositionPositionY);
          }
          else if (this.id == 'perfecto-ymover-down') {
            compositionPositionY = compositionPositionY + movestep;
            $compositionControlsYMoverInput.val(compositionPositionY);
          }
          composition.css({
            'left': compositionPositionX,
            'top': compositionPositionY
          });
          $.cookie('perfecto_composition_position_x', compositionPositionX, {path: Drupal.settings.basePath});
          $.cookie('perfecto_composition_position_y', compositionPositionY, {path: Drupal.settings.basePath});
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

        // Move all compositions to inside of body tag for hovering the composition on top of the page.
        setOverlayToFrontOfPage = function () {
          $compositions.css('z-index', 99999).appendTo($body);
          if (compositionVisible === true) {
            $body.css('opacity', 1);
          }
        }

        // Move all compositions out of body so the design would be properly under the page.
        setOverlayToBehindOfPage = function () {
          $compositions.css('z-index', -99999).insertAfter($body);
          if (compositionVisible === true) {
            $body.css('opacity', compositionOpacity);
          }
        }

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
    }
  }
})(jQuery);
