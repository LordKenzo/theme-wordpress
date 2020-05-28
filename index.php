<?php get_header(); ?>
<h1>Welcome to Wordpress</h1>
<?php if($wp_query->have_posts()) { ?>
    <?php while($wp_query->have_posts()) { ?>
        <?php $wp_query->the_post(); ?>
        <h2>
            <a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>">
                <?php the_title(); ?>
            </a>
        </h2>
        <div>
            <?php lftheme_post_meta() ?>
        </div>
        <div>
            <?php the_excerpt(); ?>
        </div>
        <?php lftheme_readmore_link() ?>

    <?php } ?>
    <?php the_posts_pagination() ?>
<?php } else { ?>
    <p><?php echo _e('Mi dispiace, nessun post trovato', '_themename') ?></p>
<?php } ?>

<?php
$comments = 1;
printf(_n('One comment', '%s comments', $comments, '_themename'), $comments);

$city = 'london';

echo esc_html__('Your city is', '_themename') . $city;

printf(
    /* translators: %s is the city name */
    esc_html__('Your city is %s', '_themename'), $city
);

?>

<?php get_footer(); ?>