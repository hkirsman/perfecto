<?php
/**
 * @file
 * Thumbnail HTML for composition to show in admin.
 */
?>
<div id="perfecto-thumbnail-list">
  <?php if($delete_all_link): ?>
    <p><?php print $delete_all_link; ?></p>
  <?php endif; ?>
  <?php foreach($thumbnails as $thumbnail): ?>
    <div class="thumbnail">
      <?php print $thumbnail['image']; ?>
      <div><?php print $thumbnail['filename']; ?></div>
      <div><?php print $thumbnail['view_full_size_link']; ?></div>
      <div><?php print $thumbnail['delete_link']; ?></div>
    </div>
  <?php endforeach; ?>
</div>