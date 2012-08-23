<?php
/**
 * @file
 * Template for composition control panel.
 *
 */
?>
<div id="perfecto__imagecompositioncontrols_wrap">
  <div id="perfecto__imagecompositioncontrols_mousehook"><!-- --></div>
  <div id="perfecto__imagecompositioncontrols" class="perfecto" style="display: none">
    <div id="perfecto__imagecompositioncontrols-inner">

      <?php if (count($compositions)): ?>
        <div class="perfecto__imagecompositioncontrols-row">
          <div class="perfecto__imagecompositioncontrols-caption">
            Composition
          </div>
          <select name="" id="perfecto__imagecompositioncontrols-files">
            <?php foreach ($compositions as $composition): ?>
            <option value="<?php print $composition->filename; ?>" <?php (isset($_COOKIE['composition_filename']) && $_COOKIE['composition_filename'] == $composition->filename)? print 'selected' : '' ?>><?php print $composition->filename; ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="perfecto__imagecompositioncontrols-row">
          <div class="perfecto__imagecompositioncontrols-caption">
            Opacity
          </div>
          <div id="perfecto__imagecompositioncontrols-opacity-slider"></div>
        </div>

        <div class="perfecto__imagecompositioncontrols-row">
          <div class="perfecto__imagecompositioncontrols-caption">
            Position X
          </div>
          <div class="perfecto__imagecompositioncontrols-mover perfecto__imagecompositioncontrols-xmover">
            <div id="perfecto__xmover-left" class="perfecto__imagecompositioncontrols-mover-decrease"></div>
            <input id="perfecto__imagecompositioncontrols-xmover-input" class="perfecto__imagecompositioncontrols-mover-input" type="text" value="0" />
            <div id="perfecto__xmover-right" class="perfecto__imagecompositioncontrols-mover-increase"></div>
          </div>
        </div>

        <div class="perfecto__imagecompositioncontrols-row">

          <div class="perfecto__imagecompositioncontrols-caption">
            Position Y
          </div>
          <div class="perfecto__imagecompositioncontrols-mover perfecto__imagecompositioncontrols-ymover">
            <div id="perfecto__ymover-down" class="perfecto__imagecompositioncontrols-mover-decrease"></div>
            <input id="perfecto__imagecompositioncontrols-ymover-input" class="perfecto__imagecompositioncontrols-mover-input" type="text" value="0" />
            <div id="perfecto__ymover-up" class="perfecto__imagecompositioncontrols-mover-increase"></div>
          </div>
        </div>

        <div class="perfecto__imagecompositioncontrols-row">

          <div class="perfecto__imagecompositioncontrols-caption">
            Lock?
          </div>
          <div class="c">
            <input type="checkbox" />
          </div>
        </div>

        <div class="perfecto__imagecompositioncontrols-row-buttons">
          <a id="perfecto__imagecompositioncontrols_toggle" class="perfecto__imagecompositioncontrols-row-button" href="javascript:void(0)">toggle</a>
          <a id="perfecto__imagecompositioncontrols_reset" class="perfecto__imagecompositioncontrols-row-button" href="javascript:void(0)">reset</a>
        </div>
      <?php else: ?>
        <?php
          print PERFECTO_WARNING_NO_COMPOSITIONS;
        ?>
      <?php endif; ?>
    </div>
  </div>
</div>