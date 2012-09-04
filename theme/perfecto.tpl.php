<?php
/**
 * @file
 * Template for composition control panel.
 */
?>
<div id="perfecto-imagecompositioncontrols-wrap">
  <div id="perfecto-imagecompositioncontrols-mousehook"><!-- --></div>
  <div id="perfecto-imagecompositioncontrols" class="perfecto" style="display: none">
    <div id="perfecto-imagecompositioncontrols-inner">

      <?php if (count($compositions)): ?>
        <div class="perfecto-imagecompositioncontrols-row">
          <?php print (l(t('Manage compositions'), 'admin/settings/perfecto', array('attributes' => array('id' => 'perfecto-imagecompositioncontrols-link-to-controlpanel')))); ?>
        </div>

        <div class="perfecto-imagecompositioncontrols-row">
          <div class="perfecto-imagecompositioncontrols-caption">
            <?php print (t('Composition')); ?>
          </div>
          <select name="" id="perfecto-imagecompositioncontrols-files">
            <?php foreach ($compositions as $composition): ?>
            <option value="<?php print $composition->filename; ?>" <?php (isset($_COOKIE['perfecto_composition_filename']) && $_COOKIE['perfecto_composition_filename'] == $composition->filename)? print ('selected') : '' ?>><?php print $composition->filename; ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="perfecto-imagecompositioncontrols-row">
          <div class="perfecto-imagecompositioncontrols-caption">
            <?php print (t('Opacity')); ?>
          </div>
          <div id="perfecto-imagecompositioncontrols-opacity-slider"></div>
        </div>

        <div class="perfecto-imagecompositioncontrols-row">
          <div class="perfecto-imagecompositioncontrols-caption">

            <?php print (t('Position X')); ?>
          </div>
          <div class="perfecto-imagecompositioncontrols-mover perfecto-imagecompositioncontrols-xmover">
            <div id="perfecto-xmover-left" class="perfecto-imagecompositioncontrols-mover-decrease"></div>
            <input id="perfecto-imagecompositioncontrols-xmover-input" class="perfecto-imagecompositioncontrols-mover-input" type="text" value="<?php print $_COOKIE['perfecto_composition_position_x']; ?>" />
            <div id="perfecto-xmover-right" class="perfecto-imagecompositioncontrols-mover-increase"></div>
          </div>
        </div>

        <div class="perfecto-imagecompositioncontrols-row">

          <div class="perfecto-imagecompositioncontrols-caption">
            <?php print (t('Position Y')); ?>
          </div>
          <div class="perfecto-imagecompositioncontrols-mover perfecto-imagecompositioncontrols-ymover">
            <div id="perfecto-ymover-down" class="perfecto-imagecompositioncontrols-mover-decrease"></div>
            <input id="perfecto-imagecompositioncontrols-ymover-input" class="perfecto-imagecompositioncontrols-mover-input" type="text" value="<?php print $_COOKIE['perfecto_composition_position_y']; ?>" />
            <div id="perfecto-ymover-up" class="perfecto-imagecompositioncontrols-mover-increase"></div>
          </div>
        </div>

        <div class="perfecto-imagecompositioncontrols-row">

          <div class="perfecto-imagecompositioncontrols-caption">
            <?php print (t('Lock?')); ?>
          </div>
          <div class="c">
            <input type="checkbox" id="perfecto-imagecompositioncontrols-lock"<?php (isset($_COOKIE['perfecto_composition_lock']) && $_COOKIE['perfecto_composition_lock'] === 'true')? print (' checked="checked"') : '' ?>  <?php   ?> />
          </div>
        </div>

        <div class="perfecto-imagecompositioncontrols-row-buttons">
          <a id="perfecto-imagecompositioncontrols-toggle" class="perfecto-imagecompositioncontrols-row-button" href="javascript:void(0)"><?php print (t('toggle')); ?></a>
          <a id="perfecto-imagecompositioncontrols-reset" class="perfecto-imagecompositioncontrols-row-button" href="javascript:void(0)"><?php print (t('reset')); ?></a>
        </div>
      <?php else: ?>
        <?php
          print (PERFECTO_WARNING_NO_COMPOSITIONS);
        ?>
      <?php endif; ?>
    </div>
  </div>
</div>
