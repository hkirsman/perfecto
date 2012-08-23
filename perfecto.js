(function($) {
  $(document).ready(function() {

    var composition_panel_url = Drupal.settings.basePath + 'admin/settings/perfecto/composition_control_panel';

    $.ajax({
      url: composition_panel_url,
      success: function(data) {
        $('body').append(data);
        init_perfecto();
      }
    });

    var init_perfecto = function() {

      var
      perfecto__mouse_x,
      perfecto__mouse_y,
      perfecto__body = $("body");

      $(document).mousemove(function(e) {
          perfecto_mouse_x = e.pageX;
          perfecto_mouse_y = e.pageY;
      });

      /**
       * Get url property
       * @param string name parameter name to get from url
       */
      function gup( name )
      {
          name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
          var regexS = "[\\?&]"+name+"=([^&#]*)";
          var regex = new RegExp( regexS );
          var results = regex.exec( window.location.href );
          if( results == null )
              return "";
          else
              return results[1];
      }

      /**
       * Show design composition on page
       */
      (function() {
          //var file = gup('composition');

          var
          imagecomposition_wrap = $('#perfecto__imagecompositioncontrols_wrap'), // the image over
          imagecompositioncontrols = $('#perfecto__imagecompositioncontrols'),
          imagecompositioncontrols_mousehook = $('#perfecto__imagecompositioncontrols_mousehook'),
          page = (document.location+'').split('/')[4].replace('.html', '').split('?')[0],
          opacity = $.cookie('perfecto__imagecompositioncontrols_opacity')?$.cookie('perfecto__imagecompositioncontrols_opacity'):0.4,
          top = $.cookie('composition_position_y')?$.cookie('composition_position_y'):0,
          left = $.cookie('composition_position_x')?$.cookie('composition_position_x'):0,
          filename = $.cookie('composition_filename')?$.cookie('composition_filename'):$('#perfecto__imagecompositioncontrols-files option:first').val(),
          lock = false,
          dragging = false,
          composition_position_x,
          composition_position_y,
          drag_start_x,
          drag_start_y,
          composition_visible = $.cookie('perfecto__imagecompositioncontrols_visible')?$.cookie('perfecto__imagecompositioncontrols_visible'):'false',
          move10px = false;

          /*if (file.length==0) {
              alert('Add file');
              return false;
          }
          */

          $('#perfecto__imagecompositioncontrols-files').change(function() {
            filename = $(this).find('option:selected').val();
            filename_full = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/unmanaged/' + filename;
            composition.attr('src', filename_full);
            $.cookie('composition_filename', filename);
          });

          var filename_full = Drupal.settings.basePath + 'sites/default/files/mod_perfecto/unmanaged/' + filename;

          var composition = $('<img id="perfecto__imagecompositioncontrols_img" src="' + filename_full + '" alt="" />');
          composition.css({
              "position": "absolute",
              "z-index" : -99999,
              "top"     : top+"px",
              "left"     : left+"px",
              "opacity" : opacity,
              "display" : composition_visible==='true'?'block':'none'
          });

          // drag the composition via small div under cursor
          var draggable_handle = $('<div id="perfecto_draggable_handle"></div>');
          draggable_handle.css("position", "absolute"); // chrome fix
          draggable_handle.draggable({
              start: function(e, ui) {
                  drag_start_y = ui.position.top;
                  drag_start_x = ui.position.left;

                  var offset_composition = composition.offset();
                  var offset_draggable_handle = draggable_handle.offset();
                  composition_position_x = offset_composition.left;
                  composition_position_y = offset_composition.top;
                  draggable_handle_drag_start_x = offset_draggable_handle.top;
                  draggable_handle_drag_start_y = offset_draggable_handle.left;

                  dragging = true;
              },
              stop: function(e, ui) {
                  var offset_composition = composition.offset();
                  dragging = false;
                  composition_position_x = offset_composition.left;
                  composition_position_y = offset_composition.top;

                  $.cookie("composition_position_y", composition_position_y);
                  $.cookie("composition_position_x", composition_position_x);
              },
              drag: function(e, ui) {
                  if (lock || !e.ctrlKey) {
                      return false;
                  }
                  top = ui.position.top;
                  left = ui.position.left;

                  composition.css({
                      "top": composition_position_y + top - drag_start_y+"px",
                      "left": composition_position_x + left - drag_start_x +"px"
                  });

                  dragging = true;
              }
          });

          $( "#perfecto__imagecompositioncontrols-opacity-slider" ).slider({
              value:opacity,
              min: 0,
              max: 1,
              step: 0.1,
              slide: function( event, ui ) {
                  $.cookie("perfecto__imagecompositioncontrols_opacity", ui.value);

                  //$("#compositionOpacity").val(ui.value);
                  perfecto__body.css({
                      "opacity": ui.value
                  });
              }
          });

          perfecto__body.after(imagecomposition_wrap);
          $('#perfecto__imagecompositioncontrols').disableSelection();
          perfecto__body.after(draggable_handle);
          perfecto__body.after(composition);

          $("#resetToggle").click(function() {
              top = left = 0;
              $.cookie("composition_position_y", top);
              $.cookie("composition_position_x", left);
              composition.css({
                  "top"     : top+"px",
                  "left"    : left+"px"
              });
          });

          if (composition_visible==="true") {
              perfecto__body.css({
                  "opacity": opacity
              });
          }

          $("#perfecto__imagecompositioncontrols_toggle").click(function() {
              if (composition_visible==="true") {
                  composition_visible = "false";
                  perfecto__body.css({
                      "opacity": 1
                  })
              } else {
                  composition_visible = "true";
                  perfecto__body.css({
                      "opacity": opacity
                  })
              }
              $.cookie("perfecto__imagecompositioncontrols_visible", composition_visible);

              /*if (opacity != 0) {
                  opacity = 0;
              } else {
                  opacity = $("#compositionOpacity").val();
              }
              */
              $("#perfecto__imagecompositioncontrols_img").toggle();
              $(this).blur();
          });

          /*
          $(document).keyup( function(e) {

              if (lock) {
                  return false;
              }

              if (e.ctrlKey ) {
                  e.isDefaultPrevented();

                  if (e.shiftKey) {
                      var step = 10;
                  } else {
                      var step = 1;
                  }

                  if (e.keyCode==38) { // up
                      top -=  step;
                  } else if ( e.keyCode==40) { // down
                      top +=  step;
                  } else if ( e.keyCode==37) { // left
                      left -= step;
                  } else if ( e.keyCode==39) { // right
                      left += step;
                  }

                  $.cookie("psdcompositionTop", top);
                  $.cookie("psdcompositionLeft", left);

                  if ( e.keyCode==38 || e.keyCode==40 ) { // up or down
                      composition.css({
                          "top"     : top+"px"
                      });
                  } else if ( e.keyCode==37 || e.keyCode==39 ) {
                      composition.css({
                          "left"     : left+"px"
                      });
                  }
                  return false;
              }
          });

               */
          $("#compositionFile").keyup( function(e) {
              if (lock) {
                  return false;
              }

              file =  $("#compositionFile").val();
              $.cookie("psdcompositionFile", file);

              //$("#compositionImg").attr("src", "/"+site+"/compositions/"+file);
          });

          // This creates little draggable div under cursor when ctrl key is held
          // down. Firefox can't move it fast enough thoug.
          $(window).keydown( function(e) {
              if (e.ctrlKey && !dragging && composition_visible=='true' ) {
                  draggable_handle.css({
                      "display" : "block",
                      "left": perfecto_mouse_x-25+"px",
                      "top" : perfecto_mouse_y-25+"px"
                  });
              }
              if (e.shiftKey) {
                  move10px = true;
              }
          });

          $(window).keyup( function(e) {
              draggable_handle.css({
                  "display" : "none"
              });
              move10px = false;
          });


          $("#compositionLock").click(function(e) {
              if ( this.checked ) {
                  lock = true;
              } else {
                  lock = false;
              }
          });

          // composition move
          var composition_mover_jquery_selector = "#perfecto__xmover-left, "+
          "#perfecto__xmover-right, "+
          "#perfecto__ymover-down, "+
          "#perfecto__ymover-up";
          $(composition_mover_jquery_selector).click(function(e) {

              if (lock) {
                  return false;
              }

              var composition_position_y = $.cookie("composition_position_y")*1.0;
              var composition_position_x = $.cookie("composition_position_x")*1.0;
              var movestep;
              if ( move10px ) {
                  movestep = 10;
              } else {
                  movestep = 1;
              }

              if (this.id=="perfecto__xmover-left") {
                  composition_position_x = composition_position_x - movestep;
                  $("#perfecto__imagecompositioncontrols-xmover-input").val(composition_position_x);
              } else if (this.id=="perfecto__xmover-right") {
                  composition_position_x = composition_position_x + movestep;
                  $("#perfecto__imagecompositioncontrols-xmover-input").val(composition_position_x);
              } else if (this.id=="perfecto__ymover-up") {
                  composition_position_y = composition_position_y - movestep;
                  $("#perfecto__imagecompositioncontrols-ymover-input").val(composition_position_y);
              } else if (this.id=="perfecto__ymover-down") {
                  composition_position_y = composition_position_y + movestep;
                  $("#perfecto__imagecompositioncontrols-ymover-input").val(composition_position_y);
              }
              composition.css({
                  "top": composition_position_y+"px",
                  "left": composition_position_x +"px"
              });
              $.cookie("composition_position_y", composition_position_y);
              $.cookie("composition_position_x", composition_position_x);
          });

          imagecomposition_wrap.bind({
              mouseenter: function() {
                  imagecompositioncontrols.css({
                      "display": "block"
                  });
              },
              mouseleave: function() {
                  if (composition_visible!=="true") {
                      imagecompositioncontrols.css({
                          "display": "none"
                      });
                  }

              }
          })

      })();

    }

  });
})(jQuery);