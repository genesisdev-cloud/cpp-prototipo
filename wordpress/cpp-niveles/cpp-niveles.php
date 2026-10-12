<?php
/**
 * Plugin Name: CPP Niveles (carrusel curvo)
 * Description: Muestra los niveles del Colegio Presbiteriano del Paraguay en un carrusel curvo de imágenes, con el nombre de cada nivel debajo. Uso: [cpp_niveles]
 * Version:     1.0.0
 * Author:      Colegio Presbiteriano del Paraguay
 * Text Domain: cpp-niveles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CPP_NIVELES_VERSION', '1.0.0' );
define( 'CPP_NIVELES_DIR', plugin_dir_path( __FILE__ ) );
define( 'CPP_NIVELES_URL', plugin_dir_url( __FILE__ ) );

/**
 * Niveles que se muestran. Cada uno tiene: nombre (se ve bajo la imagen),
 * foto, texto alternativo y las líneas de texto de la lista inferior
 * (cada línea es array( 'parte en negrita', 'resto del texto' )).
 *
 * Se puede modificar desde el tema con el filtro `cpp_niveles_datos`.
 */
function cpp_niveles_datos() {
	$niveles = array(
		array(
			'etiqueta' => 'Nivel Inicial',
			'imagen'   => CPP_NIVELES_URL . 'assets/img/nivel-inicial.webp',
			'alt'      => 'Niños en el aula del Nivel Inicial',
			'lineas'   => array(
				array( 'Pre-Jardín', '3 años.' ),
				array( 'Jardín', '4 años.' ),
				array( 'Pre-Escolar', '5 años.' ),
			),
		),
		array(
			'etiqueta' => 'Educación Escolar Básica',
			'imagen'   => CPP_NIVELES_URL . 'assets/img/nivel-basica.webp',
			'alt'      => 'Alumnos de la Educación Escolar Básica',
			'lineas'   => array(
				array( '', 'De primer a noveno grado, organizada en tres ciclos.' ),
			),
		),
		array(
			'etiqueta' => 'Educación Media',
			'imagen'   => CPP_NIVELES_URL . 'assets/img/nivel-media.webp',
			'alt'      => 'Estudiantes de la Educación Media',
			'lineas'   => array(
				array( 'Bachillerato Científico', 'Ciencias Sociales y Ciencias Básicas.' ),
			),
		),
	);

	return apply_filters( 'cpp_niveles_datos', $niveles );
}

/** Registra (sin cargar todavía) los archivos de estilo y script. */
function cpp_niveles_registrar_assets() {
	wp_register_style( 'cpp-niveles', CPP_NIVELES_URL . 'assets/tilted-grid.css', array(), CPP_NIVELES_VERSION );
	wp_register_script( 'cpp-niveles', CPP_NIVELES_URL . 'assets/tilted-grid.js', array(), CPP_NIVELES_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'cpp_niveles_registrar_assets' );

/**
 * Shortcode [cpp_niveles]
 *
 * Atributos (todos opcionales):
 *   ids="12,34,56"     fotos de la Biblioteca de medios, en el orden de los niveles
 *   altura="560"       alto del carrusel en escritorio (px)
 *   altura_movil="340" alto del carrusel en celular (px)
 *   velocidad="4"      segundos que tarda la fila en avanzar un tile
 *   curvatura="80"     cuánto se curvan los extremos (5 a 85)
 */
function cpp_niveles_shortcode( $atts ) {
	$a = shortcode_atts(
		array(
			'ids'          => '',
			'altura'       => '560',
			'altura_movil' => '340',
			'velocidad'    => '4',
			'curvatura'    => '80',
		),
		$atts,
		'cpp_niveles'
	);

	$niveles = cpp_niveles_datos();

	// Fotos de la Biblioteca de medios (opcional).
	$ids = array_values( array_filter( array_map( 'absint', explode( ',', $a['ids'] ) ) ) );
	foreach ( $niveles as $i => $nivel ) {
		if ( isset( $ids[ $i ] ) ) {
			$url = wp_get_attachment_image_url( $ids[ $i ], 'large' );
			if ( $url ) {
				$niveles[ $i ]['imagen'] = $url;
			}
		}
	}

	$imagenes = array();
	foreach ( $niveles as $nivel ) {
		$imagenes[] = array(
			'src'   => $nivel['imagen'],
			'label' => $nivel['etiqueta'],
			'alt'   => $nivel['alt'],
		);
	}

	$config = array(
		'images' => $imagenes,
		'speed'  => (float) $a['velocidad'],
		'curve'  => (float) $a['curvatura'],
	);

	$altura       = absint( $a['altura'] );
	$altura_movil = absint( $a['altura_movil'] );

	wp_enqueue_style( 'cpp-niveles' );
	wp_enqueue_script( 'cpp-niveles' );

	ob_start();
	include CPP_NIVELES_DIR . 'templates/niveles.php';
	return ob_get_clean();
}
add_shortcode( 'cpp_niveles', 'cpp_niveles_shortcode' );
