<?php

function _themename_post_meta() {
    printf(
        esc_html__('Inviato il %s', 'base'),
        '<a href="' . esc_url(get_permalink()) .'"> <time datetime="' . esc_attr(get_the_date('c')) . '">' . esc_html(get_the_date()) . '</time></a>'
    );

    printf(
        esc_html__(' Da %s', '_themename'),
        '<a href="' . esc_url(get_author_posts_url( get_the_author_meta('ID'))) . '">' . esc_html(get_the_author()) . '</a>'
    );
}

function _themename_readmore_link() {
    
    echo '<a href="'. esc_url(get_permalink()) . '"'; 
    echo 'title="' . the_title_attribute(['echo' => false]) .'">';
    printf(
        wp_kses(
            __('Read More <span class="u-sceen-reader-text">About %s</span>'
            ,'_themename'),
            [
                'span' => [
                    'class' => []
                ]
            ]
                ),
        get_the_title()
    );
    echo '</a>';
}

?>