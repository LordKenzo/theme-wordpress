<?php

function _themename_assets() {
    // wp_enqueue_style('handler', src, deps, ver, media)
    wp_enqueue_style( '_themename-stylesheet', get_template_directory_uri() . '/dist/assets/css/main.css', array(), '1.0.0', 'all');

    // wp_enqueue_script( $handle:string, $src:string, $deps:array, $ver:string|boolean|null, $in_footer:boolean )
    wp_enqueue_script( '_themename-scripts', get_template_directory_uri() . '/dist/assets/js/bundle.js', array('jquery'), '1.0.0', true );

   
}

function _themename_admin_assets() {
    wp_enqueue_style( '_themename-admin-stylesheet', get_template_directory_uri() . '/dist/assets/css/admin.css', array(), '1.0.0', 'all');

    wp_enqueue_script( '_themename-admin-scripts', get_template_directory_uri() . '/dist/assets/js/admin.js', array(), '1.0.0', true );
}

// add_action(action_name, function_name)

add_action('wp_enqueue_scripts', 'lftheme_assets');

add_action('admin_enqueue_scripts', 'lftheme_admin_assets');