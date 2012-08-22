<?php
/**
 * @file
 * Template for overlay navigation.
 *
 */
?>
<div id="perfecto__imageoverlaycontrols_wrap">
  <div id="perfecto__imageoverlaycontrols_mousehook"><!-- --></div>
  <div id="perfecto__imageoverlaycontrols" class="perfecto" style="display: none">
    <div id="perfecto__imageoverlaycontrols-inner">

      <div class="perfecto__imageoverlaycontrols-row">
        <div class="perfecto__imageoverlaycontrols-caption">
          Overlay
        </div>
        <select name="" id="perfecto__imageoverlaycontrols-files">
          <?php foreach ($overlays as $overlay): ?>
          <option value="<?php print $overlay->filename; ?>" <?php (isset($_COOKIE['overlay_filename']) && $_COOKIE['overlay_filename'] == $overlay->filename)? print 'selected' : '' ?>><?php print $overlay->filename; ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="perfecto__imageoverlaycontrols-row">
        <div class="perfecto__imageoverlaycontrols-caption">
          Opacity
        </div>
        <div id="perfecto__imageoverlaycontrols-opacity-slider"></div>
      </div>

      <div class="perfecto__imageoverlaycontrols-row">
        <div class="perfecto__imageoverlaycontrols-caption">
          Position X
        </div>
        <div class="perfecto__imageoverlaycontrols-mover perfecto__imageoverlaycontrols-xmover">
          <div id="perfecto__xmover-left" class="perfecto__imageoverlaycontrols-mover-decrease"></div>
          <input id="perfecto__imageoverlaycontrols-xmover-input" class="perfecto__imageoverlaycontrols-mover-input" type="text" value="0" />
          <div id="perfecto__xmover-right" class="perfecto__imageoverlaycontrols-mover-increase"></div>
        </div>
      </div>

      <div class="perfecto__imageoverlaycontrols-row">

        <div class="perfecto__imageoverlaycontrols-caption">
          Position Y
        </div>
        <div class="perfecto__imageoverlaycontrols-mover perfecto__imageoverlaycontrols-ymover">
          <div id="perfecto__ymover-down" class="perfecto__imageoverlaycontrols-mover-decrease"></div>
          <input id="perfecto__imageoverlaycontrols-ymover-input" class="perfecto__imageoverlaycontrols-mover-input" type="text" value="0" />
          <div id="perfecto__ymover-up" class="perfecto__imageoverlaycontrols-mover-increase"></div>
        </div>
      </div>

      <div class="perfecto__imageoverlaycontrols-row">

        <div class="perfecto__imageoverlaycontrols-caption">
          Lock?
        </div>
        <div class="c">
          <input type="checkbox" />
        </div>
      </div>

      <div class="perfecto__imageoverlaycontrols-row-buttons">
        <a id="perfecto__imageoverlaycontrols_toggle" class="perfecto__imageoverlaycontrols-row-button" href="javascript:void(0)">toggle</a>
        <a id="perfecto__imageoverlaycontrols_reset" class="perfecto__imageoverlaycontrols-row-button" href="javascript:void(0)">reset</a>
      </div>
    </div>
  </div>
</div>