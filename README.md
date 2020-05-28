In VSCode installati WordPress Snippets.

Possiamo dividere il tema in varie parti come: header - sidebar - navigation - content area - comment section - footer ecc..

Quindi ho una serie di Sections e divido il tutto in vari file, in una sorta di componenti.

Fondamentalmente necessitiamo di 2 file: `index.php` e il foglio di stile `style.css`. Poi abbiamo il file functions.php per fare l'override di alcune funzioni di WordPress.

Nella struttura di un template avrò, oltre ad index.php e style.css, la pagina responsabile per visualizzare un singolo Blog Post, un elenco di Blog Archiviati, una pagina di risultati di una ricerca, una pagina statica, la pagina di errore 404, la pagina footer e header ed un file screenshot.png.

Vedi anche: https://wphierarchy.com/

Il foglio di stile deve iniziare con dei metadati di info sul tema tra un commento.

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

```
add_action( 'init', 'miotemplate_menus' );

add_action( 'widgets_init', 'miotemplate_sidebar_registration' );
```

Nota che i Widget vengono chiamati Sidebar nel codice dei template. Ovviamente è un nome quindi posso scrivere anche `miotemplate_widget_registration`, non cambia nulla, mentre `init` e `widgets_init` sono gli hook preposti ed il nome è quello!
 
Sempre nel file **functions.php** posso trovare:

* la funzione per inserire il Titolo della pagina dinamicamente usando una funzione che richiama add_theme_support('title-tag') e richiamadola dall'hook: add_action('after_setup_theme','nomefunzione'). Questo fa si che il titolo venga iniettato automaticamente nell'index.

* la funzione per inserire il menu consiste nel creare un array di posizioni del menù (Primary, Footer, Social, ecc...). Ogni template può avere una o più posizioni.

```
$locations = array(
  'primary' => 'Desktop Primary Menu',
  'footer' => 'Footer Menu'
)
```

e nel codice in header.php avrò:

```
wp_nav_menu(
  array(
    'menu' => 'primary',
    'container' => '',
    'theme_location' => 'primary',
    'items_wrap' => '<ul id="" class"">%3$s</ul>'
  )
);
```

Ora in ul posso passare le mie classi del mio stile, avendo ripulite quelle che inserisce di default WordPress.
Invece ora in items_wrap posso andare ad inserire le mie classi magari di Bootstrap:

```
'items_wrap' => '<ul id="" class"navbar-nav flex-column text-sm-center text-md-left">%3$s</ul>'
```

E per gli elementi li? Devo farlo da dentro la struttura del menu in WordPress. In Appearance -> Menus devo abilitare da Screen Options a in alto a destra le CSS Classes e Link Target. Ora posso specificare una CSS Classes per le mie voci di menù come ad esempio: "nav-item".

Altro metodo è specificare il menu_class:

```
<?php
    wp_nav_menu( array(
        'theme_location' => 'primary',
        'menu_class'     => 'primary-menu',
         ) );
?>
```

e nel CSS avrò qualcosa di simile, dove rimpiazzerò #header con la classe o l'id del mio nav menù.

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

# Organizziamo functions.php

Per organizzare al meglio functions.php posso creare una cartella `lib` con un file `helpers.php` dove posso inserire le mie funzioni helper (posso fare come meglio credo con i nomi).

In functions.php avrò:

```
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
    wp_enqueue_style( 'lftheme-stylesheet', get_template_directory_uri(  ) . '/dist/assets/css/main.css', array(), '1.0.0', 'all');
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

```
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

# Placeholder

Abbiamo visto che le funzioni php le chiamiamo con un prefisso e anche il text domain. Posso creare un placeholder.
Attenzione che se chiami il tema con caratteri illeciti puoi avere problemi con i nomi delle funzioni, tipo usare '-' al posto di '_'.

```php
function lftheme_assets() {
```

in 

```php
function _themename_assets() {
```


```js
import replace from 'gulp-replace';
import info from './package.json';

...
// const nameZip = 'base'; RIMUOVO

export const compress = () => {
  return gulp
    .src(paths.package.src)
    .pipe(replace('_themename', info.name.replace('-', '_')))
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
    .pipe(replace('_themename', info.name.replace('-', '_')))
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