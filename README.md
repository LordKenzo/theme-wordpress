# WordPress

[Sito Italiano](https://it.wordpress.org/)
[Sito Documentazione Codex](https://codex.wordpress.org/it:Main_Page)


# Creare un Tema WordPress

In VSCode installa `WordPress Snippets`.

Possiamo dividere il tema in varie parti come: header - sidebar - navigation - content area - comment section - footer ecc..

Quindi ho una serie di Sections e divido il tutto in vari file, in una sorta di componenti.

Fondamentalmente necessitiamo di 2 file: `index.php` e il foglio di stile `style.css`. Poi abbiamo il file functions.php per fare l'override di alcune funzioni di WordPress.

Nella struttura di un template avrò, oltre ad index.php e style.css, la pagina responsabile per visualizzare un singolo Blog Post, un elenco di Blog Archiviati, una pagina di risultati di una ricerca, una pagina statica, la pagina di errore 404, la pagina footer e header ed un file screenshot.png.

Vedi anche: https://wphierarchy.com/

Il foglio di stile deve iniziare con dei metadati di info sul tema tra un commento:

```css
/*
Theme name: Tema Custom
Author: Lorenzo Franceschini
Author URI: https://lorenzofranceschini.com
Description: My first WordPress theme
Version: 1.0
Text Domain: base
Tags: responsive, translation-ready, bootstrap
*/
```

Le informazioni di base sono il nome del tema, l'autore e la versione.

# Sistema di Gerarchia

WordPress utilizza un sistema di gerarchia interno per selezionare il template da visualizzare, in base all'URL della risorsa. Ad esempio per una categoria, cercherà un file che conterrà il nome della categoria in un file nel formato `category-nomecategoria.php`, poi userà l'ID `category-ID.php`, poi il generico `category.php`, poi `archive.php` ed infine userà `index.php` come fallback. Per questo index.php è lìunico file php che veramente serve.

[CHART GERARCHIA](https://developer.wordpress.org/files/2014/10/wp-hierarchy.png)

# Template Tag

Nella costruzione delle mie pagine php userò i Template Tag cioè funzioni che fanno qualcosa o prelevano dati. [QUI](https://codex.wordpress.org/Template_Tags) trovo un elenco di queste funzioni.

Ad esempio nella sezione "General tags" trovo `get_header()` e `get_footer()`.

Tutte queste funzioni fanno parte del core di Wordpress che userò insieme agli **hooks** spesso e volentieri, per prelevare dati o fare delle azioni in determinati momenti del ciclo di vita del sito.

# Primi passi con Index Header e Footer

Partendo dal file index.php, posso dividere il mio template con 3 file base: index.php, header.php e footer.php e usare le funzioni get_header() e get_footer() in index.php:

```
<?php get_header(); ?>
<h1>Welcome to Wordpress</h1>
<?php get_footer(); ?>
```

Posso avere il file footer con un altro nome? Si, lo posso chiamare ad es: 'footer-2.php', è obbligo avere il trattino e richiamarlo con get_footer('2') da index.php

E' interessante vedere come nell'header.php posso inserire le funzioni wordpress per avere dinamicamente il language attribute del sito, il charset ed il titolo grazie a wp_head():

```html
<!DOCTYPE html>
<html <?php language_attributes(); ?> >
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body>
```

mentre nel footer posso usare wp_footer() per caricare eventuali script. Puoi notare che WordPress aggancia subito un suo script dall'inspector della pagina generata.

```html
<footer>
<p>&copy; by Lorenzo Franceschini</p>
</footer>
<? wp_footer() ?>
</body>
</html>
```

e lo script iniettato sarà: `<script type="text/javascript" src="http://base.local/wp-includes/js/wp-embed.min.js?ver=5.4.1"></script>`.

Quindi:

* get_header() e get_footer() per iniettare le pagine header.php e footer.php (esiste anche la get_sidebar per la sidebar.php);
* bloginfo per prendere informazioni dal database
* language_attributes() per prelevare il language del sito
* wp_head() e wp_footer() per inserire file di stile e script

Le funzioni che iniziano con get_ solitamente le vediamo precedute da echo in quanto ritornano un risultato che potrei voler stampare, come get_permalink, get_the_date, get_the_title, get_the_author, ecc...

ed ecco un index.php completo con il famoso "The Loop", in cui verifichiamo se abbiamo dei posts con have_posts(), creiamo la variabile globale $post grazie alla funzione helper the_post() che devo chiamare subito dopo il while. Andiamo ad usare degli accorgimenti per l'accessibilità, come ad esempio riportare il titolo dopo il "Read more" con uno span che verrà visualizzato solo dagli screen reader tramite una classe CSS che andrò ad implementare.
Un altra osservazione per l'accessibilità è `get_the_date('c')` con 'c' inseriamo il formato in time accessibile agli screen reader. Questo migliora anche la SEO.
E' bene non inserire il formato della data come nell'esempio con 'l, F j, Y' per poter permettere l'amministratore il settaggio da Wordpress.

```php
<?php get_header(); ?>
<h1>Welcome to Wordpress</h1>
<?php if(have_posts()) { ?>
    <?php while(have_posts()) { ?>
        <?php the_post(); ?>
        <h2>
            <a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>">
                <?php the_title(); ?>
            </a>
        </h2>
        <div>
            Inviato il <a href="<?php echo get_permalink(); ?>">
                <time datetime="<?php echo get_the_date('c')?>">
                    <?php echo get_the_date('l, F j, Y'); ?>
                </time>
            </a>
            Da <a href="<?php echo get_author_posts_url( get_the_author_meta('ID'))?>">
                <?php echo get_the_author() ?>
            </a>
        </div>
        <div>
            <?php the_excerpt(); ?>
        </div>
        <a href="<?php echo get_permalink()?> title="<?php the_title_attribute(); ?>">
            Read More <span clasS="u-sceen-reader-text">about <?php the_title(); ?></span>
        </a>

    <?php } ?>
    <?php the_posts_pagination() ?>
<?php } else { ?>
    <p>Mi dispiace, nessun post trovato</p>
<?php } ?>
<?php get_footer(); ?>
```

# Comprendere il Loop

Riassumendo il LOOP possiamo vederla:

```php
if ( have_posts() ) {
  while ( have_posts() ) {
    the_post();
    the_title();
  }
} else {
   // ...
}
```

Per prelevare i post dal database, WP ha una classe chiamata WP_Query con cui posso interagire per creare le mie istanze:

```php
$custom_query = new WP_Query(array('cat' => 2));
if ( $custom_query->have_posts() ) {
  echo '<ul>';
  while($custom_query->have_posts()) {
    $custom_query->the_post();
    echo '<li>' . get_the_title(). '</li>';
  }
  echo '</ul'>;
}
wp_reset_postdata();
```

Qui uso $query->metodo e non metodo direttamente, che è in realtà una funzione helper che wrappa il metodo.

Prova ad inserire nell'index.php:

```php
<pre>
  <?php var_dump($wp_query) ?>
</pre>
```

Di questo oggetto è interessante notare:

```
public 'post_count' => int 2
public 'current_post' => int -1
public 'in_the_loop' => boolean false
public 'post' => ...
public 'posts' => 
    array (size=2)
      0 => ...
```

Queste variabili sono utili durante il Loop. A queste viene associata la variabile globale $post. Quando faccio have_posts() è come se facessi $wp_query->have_posts().
La funzione helper the_post() (che sarebbe $wp_query->the_post()) imposta il current_post, il post e imposta la variabile globale $post.

Ora questa impostazione globale di $post può causare problemi se ho, delle custom_query che mi vanno a modificare il $post e voglio tornare all'oggetto originale, ad es. potrei avere un post con sotto la visualizzazioni di altri post consigliati, prelevati con una custom query che mi impostano il mio post globale e successivamente se volessi far riferimento nuovamente al post originale devo importare questo wp_reset_postdata()

# Frontpage e Functions.php

Primi passi su frontpage.php e functions.php

Ora nel file frontpage.php posso inserire il codice index.html del mio template HTML e andare a puntare il file style.css scrivendo il path 'wp-content/themes/nome-tema/style.css`, ma questa soluzione hard coded è da evitare.

Per questo andiamo a scrivere la prima funzione in functions.php che aggacia l'hook di WordPress per il caricamento degli script:

```php
<?php
function lf_register_styles(){
    wp_enqueue_style('lftheme-style', get_template_directory_uri() . '/style.css', array(), '1.0', 'all');
}

add_action( 'wp_enqueue_scripts', 'lf_register_styles');

?>
```

Per caricarlo mi basta andare in front-page.php ed inserire:

```php
<?php
  wp_head();
?>

Il nome della funzione è bene metterlo con un prefisso e il nome `lftheme-style` individua il mio style. Ora inseriamo Bootstrap e FontAwesome. Posso usare versioni locali o versioni CDN. Io copio e incollo i file CSS locali in assets/css e in assets/webfont che servono a FontAwesome.
Ovviamente va preservato l'ordine dei fogli di stile, così come da creazione del proprio template HTML. Se avessi avuto il CDN avrei messo l'URL completo di HTTP:

```php
<?php
function lf_register_styles(){
    
    wp_enqueue_style('lftheme-fontawesome', get_template_directory_uri() . '/assets/css/fontawesome.min.css', array(), '1.0', 'all');

    wp_enqueue_style('lftheme-bootstrap', get_template_directory_uri() . '/assets/css/bootstrap.min.css', array(), '1.0', 'all');
    
    wp_enqueue_style('lftheme-style', get_template_directory_uri() . '/style.css', array(), '1.0', 'all');
}

add_action( 'wp_enqueue_scripts', 'lf_register_styles');

?>
```

Nell'array posso specificare la dipendenza e quindi avere un ordine diverso:

```php
<?php
function lf_register_styles(){
    wp_enqueue_style('lftheme-style', get_template_directory_uri() . '/style.css', array(), '1.0', 'all');
    
    wp_enqueue_style('lftheme-fontawesome', get_template_directory_uri() . '/assets/css/fontawesome.min.css', array(), '5.13.0', 'all');
    
    wp_enqueue_style('lftheme-bootstrap', get_template_directory_uri() . '/assets/css/bootstrap.min.css', array('lftheme-bootstrap'), '4.4.1', 'all');
}

add_action( 'wp_enqueue_scripts', 'lf_register_styles');

?>
```

Ora la versione è hard coded.

Mi basterà fare: `$version = wp_get_theme()->get('Version');` ed usare `$version` al posto di '1.0':

```php
<?php
function lf_register_styles(){
    $version = wp_get_theme()->get('Version');
    wp_enqueue_style('lftheme-style', get_template_directory_uri() . '/style.css', array('lftheme-bootstrap'), $version, 'all');

    wp_enqueue_style('lftheme-bootstrap', get_template_directory_uri() . '/assets/css/bootstrap.min.css', array(), '4.4.1', 'all');
    
    wp_enqueue_style('lftheme-fontawesome', get_template_directory_uri() . '/assets/css/fontawesome.min.css', array(), '5.13.0', 'all');
    
    
}

add_action( 'wp_enqueue_scripts', 'lf_register_styles');

?>
```

Per gli script userò in front-page.php:

```php
<?php
  wp_footer();
?>
```

e avrò:

```php
function lf_register_scripts(){
    wp_enqueue_script('lftheme-jquery', 'https://code.jquery.com/jquery-3.4.1.slim.min.js', array(), '3.4.1', true);
    wp_enqueue_script('lftheme-popper', 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js', array(), '1.16.0', true);
    wp_enqueue_script('lftheme-bs', 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js', array(), '4.4.1', true);
    wp_enqueue_script('lftheme-script', get_template_directory_uri() . '/assets/js/script.js', true);
}

add_action( 'wp_enqueue_scripts', 'lf_register_scripts');
```

dove il true finale indica che voglio gli script nella sezione footer e non nello head.
Attento ai CONFLITTI DI NOME!

E' importante capire che alcune funzionalità del menù WORDPRESS non saranno presenti se non sono presenti le funzioni di gestione in functions.php. Ad esempio potrei non avere i settaggi dei Widget e dei Menu senza gli hook e le relative funzioni: 

```php
add_action( 'init', 'miotemplate_menus' );

add_action( 'widgets_init', 'miotemplate_sidebar_registration' );
```

Nota che i Widget vengono chiamati Sidebar nel codice dei template. Ovviamente è un nome quindi posso scrivere anche `miotemplate_widget_registration`, non cambia nulla, mentre `init` e `widgets_init` sono gli hook preposti ed il nome è quello!
 
Sempre nel file **functions.php** posso trovare:

* la funzione per inserire il Titolo della pagina dinamicamente usando una funzione che richiama add_theme_support('title-tag') e richiamadola dall'hook: add_action('after_setup_theme','nomefunzione'). Questo fa si che il titolo venga iniettato automaticamente nell'index.

* la funzione per inserire il menu consiste nel creare un array di posizioni del menù (Primary, Footer, Social, ecc...). Ogni template può avere una o più posizioni.

```php
function lf_menus() {
    $locations = array(
      'primary' => 'Desktop Primary Menu',
      'footer' => 'Footer Menu'
    );
    register_nav_menus($locations);
}

add_action('init', 'lf_menus');
```

Creo un menù nella parte Admin del sito e nellì'header.php (fai attenzione in WordPress a specificare correttamente la location del menù o il codice seguente non funzionerà) inserisco, dove meglio credo (e dopo il tag body), il mio menù:

```php
<?php
    wp_nav_menu(
        array(
            'menu' => 'primary',
            'container' => '',
            'theme_location' => 'primary'
        )
    );
?>
```

e nel codice in header.php avrò:

```php
wp_nav_menu(
  array(
    'menu' => 'primary',
    'container' => '',
    'theme_location' => 'primary',
    'items_wrap' => '<ul id="" class"">%3$s</ul>'
  )
);
```

Se ispeziono il codice HTML posso notare che i miei tag `li` hanno le classi css impostato di default da WordPress: `page_item page-item-11`. WordPress wrappa il menù all'interno di un div con class `menu`.

[Info](https://developer.wordpress.org/reference/functions/wp_nav_menu/)

WordPress prevede che il container sia o un `div` o un `nav`, a cui posso associare delle classi e un id con `menu_class` e `menu_id`:

```php
wp_nav_menu(
    array(
        'menu' => 'primary',
        'theme_location' => 'primary',
        'container' => 'nav',
        'container_class' => 'container-class',
        'container_id' => 'container-id',
        'menu_class' => 'menu-nav',
        'menu_id' => 'primary-nav',
        'link_before' => '<span class="text">',
        'link_after'  => '</span>'
    )
);
```

Con `container_id` e `container_class` aggiungo `id` e `class` al tag `nav` (o `div` se usavo un `div`).
Con `menu_id` e `menu_class` invece imposto `id` e `class` al mio tag `ul` inserito da WordPress.
Con `link_before` e `link_after` genero un anchora tag `a` con internamente uno `span`.

Con `items_wrap` posso andare ad inserire le mie classi in `ul` sovrascrivendo `menu_class` e `menu_id` ma, soprattutto, posso ridefinire il mio wrapper, che di default è un tag `ul`, quindi lo uso se voglio specificare un tag diverso da `ul`. Attenzione ad inserire `%3$s` per avere al suo interno il contentuo:

```php
'items_wrap' => '<ul id="" class"navbar-nav flex-column text-sm-center text-md-left">%3$s</ul>'
```

ha più senso se volessi specificare un `div` al post di `ul`:

```php
'items_wrap' => '<div id="asd" class="asd">%3$s</div>',
```

E per gli elementi li? Devo farlo da dentro la struttura del menu in WordPress. In Appearance -> Menus devo abilitare da Screen Options a in alto a destra le CSS Classes e Link Target. Ora posso specificare una CSS Classes per le mie voci di menù come ad esempio: "nav-item".

Un altro metodo (forse il migliore) è quello di creare qualcosa di simile a:

```php
'add_li_class'  => 'mia-classe-1 altra-mia-classe',
```

e in functions.php utilizzo l'add_filter e l'hook `nav_menu_css_class`, devo passare anche un valore di priorità ed un valore di accepted_args:

```
add_filter( $tag:string, $function_to_add:callable, $priority:integer, $accepted_args:integer )
```

```php
function add_custom_class_on_li($classes, $item, $args) {
  if(isset($args->add_li_class)) {
      $classes[] = $args->add_li_class;
  }
  return $classes;
}

add_filter('nav_menu_css_class', 'add_custom_class_on_li', 1, 3);
```

Altro metodo è specificare il menu_class:

```php
<?php
    wp_nav_menu( array(
        'theme_location' => 'primary',
        'menu_class'     => 'primary-menu',
         ) );
?>
```

e nel CSS avrò qualcosa di simile, dove rimpiazzerò #header con la classe o l'id del mio nav menù. Quindi in sostanza vado a cambiare il mio CSS e lo riadatto per WordPress.

```
// container class
#header .primary-menu{} 
 
// container class first unordered list
#header .primary-menu ul {} 
 
//unordered list within an unordered list
#header .primary-menu ul ul {} 
 
 // each navigation item
#header .primary-menu li {}
 
// each navigation item anchor
#header .primary-menu li a {} 
 
// unordered list if there is drop down items
#header .primary-menu li ul {} 
 
// each drop down navigation item
#header .primary-menu li li {} 
 
// each drap down navigation item anchor
#header .primary-menu li li a {} 
```

Altrimenti WordPress genera ed inserisce le seguenti classi CSS:

```
// Class for Current Page
.current_page_item{} 
 
// Class for Current Category
.current-cat{} 
 
// Class for any other current Menu Item
.current-menu-item{} 
 
// Class for a Category
.menu-item-type-taxonomy{}
  
// Class for Post types
.menu-item-type-post_type{} 
 
// Class for any custom links
.menu-item-type-custom{} 
 
// Class for the home Link
.menu-item-home{} 
```

Insomma abbiamo visto varie soluzioni per gestire il menù, sicuramente la soluzione più elegante è quella di usare add_filter.

# Custom Logo e Title Dinamico

Potrei avere nella barra della navigazione il Logo e volere inserire il titolo in maniera dinamica nella sezione `head`. Posso renderlo dinamico e cambiarlo da pannello admin. Utilizzo l'hook `after_setup_theme` e richiamo la funzione theme_support:

```php

function lf_theme_support() {
  // Aggiunge il title nell'head - imposto da Site Idenity con Site Title e Tagline
  add_theme_support('title-tag');
  // Aggiunge la possibilità di selezionare il LOGO in Site Indentity in Customize Theme
  add_theme_support('custom-logo');
}

add_action('after_setup_theme', 'lf_theme_support');
```

e al posto del logo "hardcoded" come ad es:

```
<img class="mb-3 mx-auto logo" src="images/logo.png" alt="logo" />
```

avrò:

```php
<?php
  if(function_exists('the_custom_logo')) {
    // Prelevo il custom_logo
    $custom_logo_id = get_theme_mod('custom_logo');
    // Creo un riferimento all'immagine (ottengo un array per questo prendo il primo)
    $logo = wp_get_attachment_image_src($custom_logo_id)[0];
    // Faccio l'output dell'immagine in img con un fallback a logo.jpg di default
  }
?>
<img class="mb-3 mx-auto logo" src="<?php echo $logo ? $logo : get_template_directory_uri() . '/assets/images/logo.jpg' ?>" alt="logo" />
```

Per avere un site name dinamico, ad esempio potrei avere un `h2` nell'header che fa riferimento al nome del sito, posso fare:

```php
<?php echo get_bloginfo('name') ?>
```

Per impostarlo vado sempre nel Customize del Theme e in Site Identity trovo il mio Title.

# Post Thumbnails

Andiamo a creare una thumbnail per il nostro Post. In functions.php andiamo a scrivere:

```php
function lf_theme_support() {
  // Aggiunge il title nell'head - imposto da Site Idenity con Site Title e Tagline
  add_theme_support('title-tag');
  // Aggiunge la possibilità di selezionare il LOGO in Site Indentity in Customize Theme
  add_theme_support('custom-logo');
  // Aggiungo la possibilità di inserire una thumbnail image al mio POST nella sezione admin per la creazione di nuovi POST
  add_theme_support('post-thumbnail');
}
```

# Single.php e Template Parts

Possiamo pensare e suddividere i nostri POST a seconda del tipo di contenuto (gallery, articoli, ecc...), per questo motivo possiamo usare la cartella `template parts`.
Partendo dal file `single.php` responsabile per la visualizzazione di un singolo post, ad esempio quando ho una URL del tipo: `miositowordpress.local/?p=22`, dove 22 è l'ID del post.

```php
<?php
  get_header();
?>
  <article>
  <?php
    if(have_posts()) {
      while(have_posts()) {
        the_post();
        // 1° parametro è il file path , il secondo è il type post
        get_template_part('template-parts/content', 'article');
      }
    }
  ?>
  </article>
<?php
  get_footer();
?>
```

il file path è il parziale del file che verrà costruito con il type, quindi il file sarà `content-article.php`:

```php
<?php
  the_content();
?>
```

Ora posso personalizzare aggiungendo tutti i metadati che compongono la mia pagina, come i tag, quando è stato pubblicato, l'image thumb, ecc...

```php
<div class="container">
  <header class="content-header">
    <div class="meta mb-3">
      <span class="date"><?php the_date(); ?></span>
      <?php
        // primo parametro: cosa inserisco prima del tag
        // cosa inserisco tra i tag
        // cosa inserisco dopo il tag
        the_tags(
          '<span class="tag"><i class="fa fa-tag"</i>',
          '</span><span class="tag"<i class="fa fa-tag"></i>',
          '</span>'
          );
      ?>
      
      <span class="comment">
        <a href="#comments"><i class="fa fa-comment"></i>
          <?php comments_number(); ?>
        </a>
      </span>
    </div>
  </header>
  <?php
    the_content();
  ?>

  // Aggiungo i commenti
  <?php 
    comments_template();
  ?>
</div>
```

# Comments.php

Il file comments.php è responsabile per la visualizzazione dei commenti al post. Creando il file comments.php, posso partire dal template twentytwenty-theme.

In questo file posso accedere ad aventuali commenti del Post con: `have_comments();`, il numero di commenti con `get_comments_number()`, posso accedere ai singoli commenti con `wp_list_comments();` simile al `wp_nav_menu()` dove passo una serie di key-value in un array:

```php
<?php 
wp_list_comments(
  array(
    'avatar_size' => 120,
    'style' => 'div', // default è un UL
  )
);
?>
```

e per i reply ho una form, in cui verifico prima se i commenti sono aperti:

```php
 if(comments_open()) {
   comment_form(
     array(
       'class_form' => '', // la classe css della form
       'title_reply_before' => '<h2 id="reply-title" class="comment-reply-title">', // che pubblica "Leave a Reply"
       'title_reply_after' => '</h2>'
     )
   );
 }
```

I commenti vanno approvati o posso impostare un auto approvazione.

# The Archive

Creiamo il file content-archive.php, in cui utilizziamo: `the_title();`, `the_date();`, `the_excerpt()`, `comments_number()` e per un Read More dinamico in href vado a metter `<?php the_permalink(); ?>` che userò anche sul title per far si che sia cliccabile, mentre per la thumbnail metterò in src `<?php the_post_thumbnail_url('thumbnail'); >`, con la stringa 'thumbnail' specifico che voglio una dimensione ridotta che ho specificato nel media size di WordPress.

Tutto questo all'interno di una struttura HTML, con div, h3, span, a ecc.. :)

in index.php inserisco:


```php
<?php
  get_header();
?>
  <article class="content">
  <?php
    if(have_posts()) {
      while(have_posts()) {
        the_post();
        // 1° parametro è il file path , il secondo è il type post
        get_template_part('template-parts/content', 'archive');
      }
    }
  ?>
  </article>
  <?php
    the_posts_pagination();
  ?>
<?php
  get_footer();
?>
```

La paginazione la imposto su Impostazione -> Lettura o Settings -> Reading nel backend WordPress.

# Content-page

Creo la pagina content-page.php in template-parts:

```php
<div class="container">

  <?php
    the_content();
  ?>

</div>
```

e in page.php avrò:

```php
<?php
  get_header();
?>
  <article>
  <?php
    if(have_posts()) {
      while(have_posts()) {
        the_post();
        // 1° parametro è il file path , il secondo è il type post
        get_template_part('template-parts/content', 'page');
      }
    }
  ?>
  </article>
<?php
  get_footer();
?>
```

# Widget

Sono porzioni d'area di personalizzazione del tema da parte dell'utente. Solitamente li trovi nelle sidebar e nel footer. Per aggiungere questa feature devo inserire in `functions.php` una funzione del tipo:

```php
function lftheme_widget_areas() {
  register_sidebar(
    array(
      'before_title' => '<h2>',
      'after_title' => '</h2>',
      'before_widget' => '',
      'after_widget' => '',
      'name' => 'Sidebar Area',
      'id' => 'sidebar-1',
      'description' => 'Sidebar Widget Area'
    )
  );

  register_sidebar(
    array(
      'before_title' => '',
      'after_title' => '',
      'before_widget' => '',
      'after_widget' => '',
      'name' => 'Footer Area',
      'id' => 'footer-1',
      'description' => 'Footer Widget Area'
    )
  );
}

add_action('widgets_init', 'lftheme_widget_areas');
```

Ora in Appearance in Widgets avrò il mio Sidebar a cui posso aggiungere feature col drag-and-drop.

e ora devo inserire il widget in un template file, ad es. header.php dove visualizzerò il widget, passandogli l'ID del Widget:

```php
// header.php
...
<?php
  dynamic_sidebar('sidebar-1');
?>
...
```

ed in footer:

```php
// footer.php
...
<?php
  dynamic_sidebar('footer-1');
?>
...
```

potrei creare il widget dove inserire i social link.

# 404 e Search Page

Il file 404.php è responsabile per la visualizzazione di pagine non esistenti.

```php
<?php
  get_header();
?>
  <article>
  <h1>Page Not Found</h1>
  <?php 
    get_search_form();
  ?>
  </article>
<?php
  get_footer();
?>
```

e ora, similmente ad archive, creo la search.php:

```php
<?php
  get_header();
?>
  <article class="content">
  <?php
    if(have_posts()) {
      while(have_posts()) {
        the_post();
        // 1° parametro è il file path , il secondo è il type post
        get_template_part('template-parts/content', 'archive');
      }
    }
  ?>
  </article>
  <?php
    the_posts_pagination();
  ?>
<?php
  get_footer();
?>
```

la search form potrei metterla anche in footer.php o farlo con i widget in Appearance -> Widgets e in Footer Area metto Search.

# Organizziamo functions.php

Per organizzare al meglio functions.php posso creare una cartella `lib` con un file `helpers.php` dove posso inserire le mie funzioni helper (posso fare come meglio credo con i nomi).

In functions.php avrò:

```php
<?php
  require_once('lib/helpers.php');
?>
```

E' sempre bene, e a volte un requirements, dare un prefix ad ogni custom functions per evitare conflitti di nomi.
Esempio in helpers.php:

```php
<?php

function lftheme_post_meta() {
    echo 'Inviato il <a href="' . get_permalink() .'">';
    echo '<time datetime="' . get_the_date('c'). '">';
    echo get_the_date();
    echo '</time>';
    echo '</a>';
    echo ' Da <a href="' . get_author_posts_url( get_the_author_meta('ID')). '">';
    echo get_the_author();
    echo '</a>';
}

function lftheme_readmore_link() {
    echo '<a href="'. get_permalink() . '"'; 
    echo 'title="' . the_title_attribute(['echo' => false]) .'">';
    echo 'Read More <span class="u-sceen-reader-text">';
    echo the_title();
    echo '</span></a>';
}

?>
```


# Altra lib

L'obiettivo è avere un functions.php così fatto:

```php
<?php

require_once('lib/helpers.php');
require_once('lib/enqueue-assets.php');
```

creo la libreria per iniettare i miei stiles e script in lib creo il file enqueue-assets.php:

```php
<?php

function lftheme_assets() {
    // wp_enqueue_style('handler', src, deps, ver, media)
    wp_enqueue_style( 'lftheme-stylesheet', get_template_directory_uri() . '/dist/assets/css/main.css', array(), '1.0.0', 'all');
}

// add_action(action_name, function_name)

add_action('wp_enqueue_scripts', 'lftheme_assets');
```

mentre il mio functions.php diventerà:

```php
<?php

require_once('lib/helpers.php');
require_once('lib/enqueue-assets.php');
```

# Validazione Sanificazione ed Escaping

La validazione e la sanificazione la faccio prima di mandare il dato nel database. La validazione accetta o rifiuta il dato, la sanificazione lo pulisce da eventuale codice malevole (script, ecc..), mentre l'escaping è la procedura che effettuo prima di mandare in visualizzazione il dato. Alcune funzioni gestite da WP sono già trattate con escaping, altre le posso trattare con:

* esc_url
* esc_html
* esc_attr

# Automatizzare con GULP

Installa GULP con `npm i gulp` e installa il cli con `npm i -g gulp-cli`. Installa anche Babel: `npm i -D @babel/register @babel/core @babel/preset-env` e crea il file .babelrc con:

```
{
    "presets": [ "@babel/preset-env" ]
}
```

e crea il file gulp.babel.js:

```js
import gulp from 'gulp';

export const hello = (done) => {
  console.log('hello');
  done();
};

export default hello;
```

Installo yargs con `npm i -D yargs gulp-if` per poter passare l'environment da riga di comando per la task, mentre gulp-if lo userò per verificare cosa applicare rispetto all'env passato.

Creo le cartelle assets e dentro JS, IMAGES e SCSS. Installo il plugin per compilare SASS e minificare i css:

```
npm i -D gulp-sass gulp-clean-css
```

Utilizzo sourcemaps in development per capire i file di provenienza e non avere il nome del bundle. Per questo installo `npm i -D gulp-sourcemaps`. Assicurati che i plugin che usi siano compatibili con gulp-sourcemaps, trovi l'elenco nella pagina github.

Minifichiamo ora le immagini installando `npm i -D gulp-imagemin`

Installo un plugin per cancellare ogni volta la cartella dist e ricrearla da zero ogni volta che lancio un task da gulp:

```
npm i -D del
```

Come src a gulp posso passare un array di entry point anziché un singolo file secco.

Aggiungo un oggetto che mi rappresenta le cartelle source e destination e la task di watch per monitorare i cambiamenti dei miei file sass.
L'oggetto ha di particolare di avere le path src e dest per le immagini, stili, js e le path per copiare altri file come i font, che non hanno bisogno di minificazione e ottimizzazione. Qui inserisco le path da esclude:

```js
const paths = {
  styles: {
    src: ['assets/scss/main.scss'],
    dest: 'dist/assets/css',
  },
  images: {
    src: 'assets/images/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/assets/images',
  },
  js: {
    src: 'assets/js/**/*.{js,jsx,ts,tsx}',
    dest: 'dist/assets/js',
  },
  copy: {
    src: [
      'assets/**/*',
      '!assets/{images,js,scss}',
      '!assets/{images,js,scss}/**/*',
    ],
    dest: 'dist/assets',
  },
};
```

Avvio con `gulp watch` o solo con `gulp`.

ed ecco il file gulp:

```js
import gulp from 'gulp';
import yargs from 'yargs';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import del from 'del';

const prod = yargs.argv.prod;

const paths = {
  styles: {
    src: ['assets/scss/main.scss'],
    dest: 'dist/assets/css',
  },
  images: {
    src: 'assets/images/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/assets/images',
  },
  js: {
    src: 'assets/js/**/*.{js,jsx,ts,tsx}',
    dest: 'dist/assets/js',
  },
  copy: {
    src: [
      'assets/**/*',
      '!assets/{images,js,scss}',
      '!assets/{images,js,scss}/**/*',
    ],
    dest: 'dist/assets',
  },
};

export const clean = () => del(['dist']);

export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(prod, cleanCSS({ compatibility: 'ie8' })))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest));
};

export const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(gulpif(prod, imagemin()))
    .pipe(gulp.dest(paths.images.dest));
};

export const copy = () => {
  return gulp.src(paths.copy.src).pipe(gulp.dest(paths.copy.dest));
};

export const build = gulp.series(
  clean, 
  gulp.parallel(
    styles,
    images,
    copy
  )
);

export const dev = gulp.series(
  clean, 
  gulp.parallel(
    styles,
    images,
    copy
  ),
  watch
);

export const watch = () => {
  gulp.watch('assets/scss/**/*.scss', styles);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.copy.src, copy);
};

export default build;
```

Conviene impostare gli script di NPM in package.json per avviare gulp:

```
"scripts": {
   "start": "gulp",
   "clean": "gulp clean",
   "build": "gulp build --prod",
   "dev": "gulp dev"
},
```

Utilizziamo WebPack per il Module Bundling dei nostri JavaScript e la transpilazione a ES5.

```
npm i -D webpack-stream babel-loader
```

e se volessi TypeScript aggiungo:

```
npm i -D typescript ts-loader @babel/preset-typescript
```

il .babelrc:

```
{
    "presets": [ "@babel/preset-env", "@babel/preset-typescript"]
}
```

creo tsconfig.json:

```
{
    "compilerOptions": {
      "outDir": "./dist/",
      "noImplicitAny": true,
      "module": "es6",
      "target": "es5",
      "jsx": "react",
      "allowJs": true
    }
}
```

E se avessi più entry point JavaScript. Se vedo dalla doc si webpack-stream o diverse soluzioni, una è quella di usare Vynal-Named:


```
npm i -D vinyl-named
```

Ed ecco il risultato, se ho due entry js ho admin.js (col map) e main.js (col map):

```bash
 ✘ JS Power 👑  themes/base-1  gulp scripts
[16:27:55] Requiring external module @babel/register
[16:27:57] Using gulpfile ~/Local Sites/base/app/public/wp-content/themes/base-1/gulpfile.babel.js
[16:27:57] Starting 'scripts'...
[16:28:12] Version: webpack 4.43.0
Built at: 28/05/2020 16:28:12
       Asset      Size  Chunks                   Chunk Names
    admin.js  4.17 KiB   admin  [emitted]        admin
admin.js.map  3.63 KiB   admin  [emitted] [dev]  admin
     main.js  5.57 KiB    main  [emitted]        main
 main.js.map  3.96 KiB    main  [emitted] [dev]  main
Entrypoint main = main.js main.js.map
Entrypoint admin = admin.js admin.js.map
[16:28:12] Finished 'scripts' after 16 s
```

aggiorno il mio gulpfile:

```
import gulp from 'gulp';
import yargs from 'yargs';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import del from 'del';
import gulpWebpack from 'webpack-stream';
import named from 'vinyl-named';

const prod = yargs.argv.prod;

const paths = {
  styles: {
    src: ['assets/scss/main.scss', 'assets/scss/admin.scss'],
    dest: 'dist/assets/css',
  },
  images: {
    src: 'assets/images/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/assets/images',
  },
  scripts: {
    src: ['assets/js/bundle.js', 'assets/js/admin.js'],
    dest: 'dist/assets/js',
  },
  copy: {
    src: [
      'assets/**/*',
      '!assets/{images,js,scss}',
      '!assets/{images,js,scss}/**/*',
    ],
    dest: 'dist/assets',
  },
};

export const clean = () => del(['dist']);

export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(prod, cleanCSS({ compatibility: 'ie8' })))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest));
};

export const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(gulpif(prod, imagemin()))
    .pipe(gulp.dest(paths.images.dest));
};

export const copy = () => {
  return gulp.src(paths.copy.src).pipe(gulp.dest(paths.copy.dest));
};

export const scripts = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(named())
    .pipe(
      gulpWebpack({
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.js$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                },
              },
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
          filename: '[name].js',
        },
        devtool: !prod ? 'source-map' : false,
        mode: prod ? 'production' : 'development',
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
};

export const watch = () => {
  gulp.watch('assets/scss/**/*.scss', styles);
  gulp.watch(paths.images.src, images);
  gulp.watch('assets/js/**/*.{js,ts}', scripts);
  gulp.watch(paths.copy.src, copy);
};

export const build = gulp.series(
  clean,
  gulp.parallel(styles, images, scripts, copy)
);

export const dev = gulp.series(
  clean,
  gulp.parallel(styles, images, scripts, copy),
  watch
);

export default build;
```

Ora posso avere una lib enqueue per la parte FRONTEND e BACKEND (admin) che produce CSS e script per entrambi:

```php
// enqueue-assets.php
<?php

function lftheme_assets() {
    // wp_enqueue_style('handler', src, deps, ver, media)
    wp_enqueue_style( 'lftheme-stylesheet', get_template_directory_uri() . '/dist/assets/css/main.css', array(), '1.0.0', 'all');

    // wp_enqueue_script( $handle:string, $src:string, $deps:array, $ver:string|boolean|null, $in_footer:boolean )
    wp_enqueue_script( 'lftheme-scripts', get_template_directory_uri() . '/dist/assets/js/bundle.js', array(), '1.0.0', true );
}

function lftheme_admin_assets() {
    wp_enqueue_style( 'lftheme-admin-stylesheet', get_template_directory_uri() . '/dist/assets/css/admin.css', array(), '1.0.0', 'all');

    wp_enqueue_script( 'lftheme-admin-scripts', get_template_directory_uri() . '/dist/assets/js/admin.js', array(), '1.0.0', true );
}

// add_action(action_name, function_name)

add_action('wp_enqueue_scripts', 'lftheme_assets');

add_action('admin_enqueue_scripts', 'lftheme_admin_assets');
```

richiamta da functions.php:

```php
<?php

require_once('lib/helpers.php');
require_once('lib/enqueue-assets.php');

```

# jQuery

Vedi la lista degli script che fanno parte del core Wordpress da [QUI](https://developer.wordpress.org/reference/functions/wp_enqueue_script/).
Se lo script che mi serve non esiste nel core allora lo installo con NPM e lo aggiungo al bundle.
Se esiste già o lo metto come dipedenza oppure lo carico semplicemente con:

wp_enqueue_script('jquery');

Wordpress già include jQuery per cui mi basta specificarlo come dipendenza:

```
 wp_enqueue_script( 'lftheme-scripts', get_template_directory_uri() . '/dist/assets/js/bundle.js', array('jquery'), '1.0.0', true );
```

e posso usarlo:

```
jQuery('body').click(() => {
  alert('ciao');
});
```

per usare il $ devo fare un paio di aggiunte, in webpack-stream aggiungo:

```
externals: {
          jquery: 'jQuery',
        },
```

e nello script:

```
import $ from 'jquery';
```

# Browersync

Mi permette di rilevare modifiche e fare il refresh del browser, quindi mi tiene in sync browser e modifiche: `npm i -D browser-sync`. E aggiorno il mio gulp file:

```php
...
import browserSync from 'browser-sync';

const server = browserSync.create();
const URL = 'http://base.local/';

...

export const serve = (done) => {
  server.init({
    proxy: URL,
  });
  done();
};

export const refresh = (done) => {
  server.reload();
  done();
};

...

export const watch = () => {
  gulp.watch('assets/scss/**/*.scss', gulp.series(styles, refresh));
  gulp.watch('**/*.php', refresh);
  gulp.watch(paths.images.src, gulp.series(images, refresh));
  gulp.watch('assets/js/**/*.{js,ts}', gulp.series(scripts, refresh));
  gulp.watch(paths.copy.src, gulp.series(copy, refresh));
};

...
```

# Bundle ZIP per Produzione

Andiamo a creare la task per creo lo zip del tema finale da distribuire.

```
npm i -D gulp-zip
```


```
import zip from 'gulp-zip';
...

const nameZip = 'base';

const paths = {
...
,
  package: {
    src: [
      '**/*',
      '!.vscode',
      '!node_modules{,/**}',
      '!packaged{,/**}',
      '!assets{,/**}',
      '!.gitnore',
      '!.babelrc',
      '!gulpfile.babel.js',
      '!package.json',
      '!package-lock.json',
      '!tsconfig.json',
    ],
    dest: 'packaged',
  },
};
...

export const compress = () => {
  return gulp
    .src(paths.package.src)
    .pipe(zip(nameZip))
    .pipe(gulp.dest(paths.package.dest));
};

...

export const bundle = gulp.series(build, compress);
```

e nel package.json vado ad inserire uno script: di comodo:

```
"bundle": "gulp bundle --prod"
```

# Placeholder Theme Name

Abbiamo visto che le funzioni php le chiamiamo con un prefisso e anche il text domain. Posso creare un placeholder, che posso chiamare come meglio credo. In questo caso lo chiamo `_themeName`.
Attenzione che se chiami il tema con caratteri illeciti puoi avere problemi con i nomi delle funzioni, tipo usare '-' al posto di '_'.

Nelle funzioni dove uso il prefix come ad es:

```php
function lftheme_assets() {
```

cambio in 

```php
function _themename_assets() {
```

e anche nel CSS style.css:

```css
/*
Theme name: _themename
Author: Lorenzo Franceschini
*/
```


```js
import replace from 'gulp-replace';
import info from './package.json';

...
// const nameZip = 'base'; RIMUOVO

export const compress = () => {
  return gulp
    .src(paths.package.src)
    .pipe(replace(themePlaceholder, info.name.replace('-', '_')))
    .pipe(zip(`${info.name}.zip`.replace('-', '_')))
    .pipe(gulp.dest(paths.package.dest));
};
```

ed ecco il gulpfile finale:

```js
import gulp from 'gulp';
import yargs from 'yargs';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import del from 'del';
import gulpWebpack from 'webpack-stream';
import named from 'vinyl-named';
import browserSync from 'browser-sync';
import zip from 'gulp-zip';
import replace from 'gulp-replace';
import info from './package.json';

const server = browserSync.create();
const URL = 'http://base.local/';
const themePlaceholder = '_themename';

const prod = yargs.argv.prod;

const paths = {
  styles: {
    src: ['assets/scss/main.scss', 'assets/scss/admin.scss'],
    dest: 'dist/assets/css',
  },
  images: {
    src: 'assets/images/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/assets/images',
  },
  scripts: {
    src: ['assets/js/bundle.js', 'assets/js/admin.js'],
    dest: 'dist/assets/js',
  },
  copy: {
    src: [
      'assets/**/*',
      '!assets/{images,js,scss}',
      '!assets/{images,js,scss}/**/*',
    ],
    dest: 'dist/assets',
  },
  package: {
    src: [
      '**/*',
      '!.vscode',
      '!node_modules{,/**}',
      '!packaged{,/**}',
      '!assets{,/**}',
      '!.gitnore',
      '!.babelrc',
      '!gulpfile.babel.js',
      '!package.json',
      '!package-lock.json',
      '!tsconfig.json',
    ],
    dest: 'packaged',
  },
};

export const serve = (done) => {
  server.init({
    proxy: URL,
  });
  done();
};

export const refresh = (done) => {
  server.reload();
  done();
};

export const clean = () => del(['dist']);

export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(prod, cleanCSS({ compatibility: 'ie8' })))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream());
};

export const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(gulpif(prod, imagemin()))
    .pipe(gulp.dest(paths.images.dest));
};

export const copy = () => {
  return gulp.src(paths.copy.src).pipe(gulp.dest(paths.copy.dest));
};

export const scripts = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(named())
    .pipe(
      gulpWebpack({
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.js$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                },
              },
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: ['.tsx', '.ts', '.js'],
        },
        externals: {
          jquery: 'jQuery',
        },
        output: {
          filename: '[name].js',
        },
        devtool: !prod ? 'source-map' : false,
        mode: prod ? 'production' : 'development',
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
};

export const watch = () => {
  gulp.watch('assets/scss/**/*.scss', styles);
  gulp.watch('**/*.php', refresh);
  gulp.watch(paths.images.src, gulp.series(images, refresh));
  gulp.watch('assets/js/**/*.{js,ts}', gulp.series(scripts, refresh));
  gulp.watch(paths.copy.src, gulp.series(copy, refresh));
};

export const compress = () => {
  return gulp
    .src(paths.package.src)
    .pipe(replace(themePlaceholder, info.name.replace('-', '_')))
    .pipe(zip(`${info.name}.zip`.replace('-', '_')))
    .pipe(gulp.dest(paths.package.dest));
};

export const build = gulp.series(
  clean,
  gulp.parallel(styles, images, scripts, copy)
);

export const dev = gulp.series(
  clean,
  gulp.parallel(styles, images, scripts, copy),
  serve,
  watch
);

export const bundle = gulp.series(build, compress);

export default build;
```