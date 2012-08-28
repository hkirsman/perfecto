// TODO: ALL JQUERY SELECTOR TO VAR
(function ($) {
  $(document).ready(function () {
    // Control panel URL for moving and choosing composition.
    // It's pulled by ajax and included after </body> tag so it can
    // be set under the page.
    var compositionControlPanel = Drupal.settings.basePath + 'admin/settings/perfecto/composition_control_panel';

    // Cache body tag
    var $body = $('body');

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
      $compositionControlsWrap = $('#perfecto__imagecompositioncontrols_wrap'),
      $compositionControlsXMoverInput = $('#perfecto__imagecompositioncontrols-xmover-input'),
      $compositionControlsYMoverInput = $('#perfecto__imagecompositioncontrols-ymover-input'),
      compositionOpacity = $.cookie('perfecto__imagecompositioncontrols_opacity') ? parseFloat($.cookie('perfecto__imagecompositioncontrols_opacity')) : 0.4,
      compositionPositionX = $.cookie('perfecto__composition_position_x') ? parseInt($.cookie('perfecto__composition_position_x')) : 0,
      compositionPositionY = $.cookie('perfecto__composition_position_y') ? parseInt($.cookie('perfecto__composition_position_y')) : 0,
      compositionFilename = $.cookie('perfecto__composition_filename') ? $.cookie('perfecto__composition_filename') : $('#perfecto__imagecompositioncontrols-files option:first').val(),
      lock = $.cookie('perfecto__composition_lock') ? parseBoolean($.cookie('perfecto__composition_lock')) : false,
      dragging = false,
      dragStartX, // Starting position of mouse x when starting to drag.
      dragStartY, // Starting position of mouse y when starting to drag.
      compositionVisible = $.cookie('perfecto__imagecompositioncontrols_visible') ? parseBoolean($.cookie('perfecto__imagecompositioncontrols_visible')) : false,
      move10px = false,
      compositionUrl,
      $draggableHandle,
      compositionMoverJQuerySelector
      $html = $('html'),
      browserIsStylizer = $html.hasClass('stylizer-preview-on');

      alert(browserIsStylizer);

      // Add mousemove event for registering mouse coordinates.
      $(document).mousemove(function (e) {
          mouseX = e.pageX;
          mouseY = e.pageY;
      });

      // Add change event to composition select tag (list all compositions).
      $('select#perfecto__imagecompositioncontrols-files').change(function () {
        compositionFilename = $(this).find('option:selected').val();
        compositionUrl = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/unmanaged/' + compositionFilename;
        composition.attr('src', compositionUrl);
        $.cookie('perfecto__composition_filename', compositionFilename);
      });

      // Add slider event to opacity control.
      $('div#perfecto__imagecompositioncontrols-opacity-slider').slider({
        value: compositionOpacity,
        min  : 0,
        max  : 1,
        step : 0.1,
        slide: function (event, ui) {
          $body.css({
            'opacity': ui.value
          });
          $.cookie('perfecto__imagecompositioncontrols_opacity', ui.value);
        }
      });

      // Add click event to reset checkbox.
      // Reset moves composition to top left corner of the browser.
      $('a#perfecto__imagecompositioncontrols_reset').click(function () {
        compositionPositionX = compositionPositionY = 0;
        $.cookie('perfecto__composition_position_x', compositionPositionX);
        $.cookie('perfecto__composition_position_y', compositionPositionY);
        composition.css({
          'left'    : compositionPositionX,
          'top'     : compositionPositionY
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

      compositionUrl = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/unmanaged/' + compositionFilename;

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
            compositionVisible = false;
            $body.css({
                'opacity': 1
            })
          }
          else {
            compositionVisible = true;
            $body.css({
                'opacity': compositionOpacity
            })
          }

          $.cookie('perfecto__imagecompositioncontrols_visible', compositionVisible);

          $('#perfecto__imagecompositioncontrols_img').toggle();

          $(this).blur();
      });

      $(document).keyup( function (e) {
        var step;

        if (lock) {
          return false;
        }

        if (e.ctrlKey ) {
          e.isDefaultPrevented();

          if (e.shiftKey) {
            step = 10;
          }
          else {
            step = 1;
          }

          alert($('html').attr('stylizer'));
          alert($('html').attr('class'));

          if (e.keyCode == 38) { // up
            top -=  step;
          }
          else if (e.keyCode == 40) { // down
            top +=  step;
          }
          else if (e.keyCode == 37) { // left
            left -= step;
          }
          else if (e.keyCode == 39) { // right
            left += step;
          }

          if (e.keyCode == 38 || e.keyCode == 40 ) { // up or down
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
        if (e.ctrlKey && !dragging && compositionVisible === true ) {
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
    }
  });
})(jQuery);