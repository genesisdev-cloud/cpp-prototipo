<?php
/**
 * Plugin Name: CPP Actividades (tarjetas que se expanden)
 * Description: Muestra las actividades complementarias del Colegio Presbiteriano del Paraguay en tarjetas con foto que se expanden al tocarlas. Uso: [cpp_actividades]
 * Version:     1.0.0
 * Author:      Colegio Presbiteriano del Paraguay
 * Text Domain: cpp-actividades
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CPP_ACT_VERSION', '1.0.0' );
define( 'CPP_ACT_DIR', plugin_dir_path( __FILE__ ) );
define( 'CPP_ACT_URL', plugin_dir_url( __FILE__ ) );

/**
 * Tarjetas que se muestran. Cada una tiene: titulo, texto, imagen, alt,
 * ancho ('1', '2' o '3' columnas) y posicion (enfoque de la foto, ej. 'center 30%').
 *
 * Se puede modificar desde el tema con el filtro `cpp_actividades_datos`.
 */
function cpp_actividades_datos() {
	$img = CPP_ACT_URL . 'assets/img/';

	$tarjetas = array(
		array(
			'titulo'   => __( 'Idiomas', 'cpp-actividades' ),
			'texto'    => __( 'Formación de idiomas desde temprana edad: español, inglés, guaraní y coreano, además de talleres únicos de música y de artes.', 'cpp-actividades' ),
			'imagen'   => $img . 'actividad-idiomas.webp',
			'alt'      => __( 'Niña sonriente en el aula', 'cpp-actividades' ),
			'ancho'    => '2',
			'posicion' => 'center 25%',
		),
		array(
			'titulo'   => __( 'Olimpiadas deportivas', 'cpp-actividades' ),
			'texto'    => __( 'El colegio promueve el deporte como parte importante de la formación. Las actividades son fútbol, handball y ping pong, con competiciones internas e intercolegiales.', 'cpp-actividades' ),
			'imagen'   => $img . 'actividad-deportes.webp',
			'alt'      => __( 'Equipo del colegio celebrando un trofeo', 'cpp-actividades' ),
			'ancho'    => '1',
			'posicion' => 'center 35%',
		),
		array(
			'titulo'   => __( 'Actividades artísticas', 'cpp-actividades' ),
			'texto'    => __( 'Talleres de danza, música, artes plásticas, teatro, folklore internacional y más.', 'cpp-actividades' ),
			'imagen'   => $img . 'actividad-artisticas.webp',
			'alt'      => __( 'Niñas del taller de danza', 'cpp-actividades' ),
			'ancho'    => '1',
			'posicion' => 'center 40%',
		),
		array(
			'titulo'   => __( 'Competencias y talleres científicos', 'cpp-actividades' ),
			'texto'    => __( 'Actividades y competencias científicas a nivel interno y nacional: matemáticas, feria de ciencias, informática y robótica.', 'cpp-actividades' ),
			'imagen'   => $img . 'actividad-ciencia.webp',
			'alt'      => __( 'Estudiantes del taller de robótica', 'cpp-actividades' ),
			'ancho'    => '2',
			'posicion' => 'center 40%',
		),
		array(
			'titulo'   => __( 'Otras actividades', 'cpp-actividades' ),
			'texto'    => __( 'Las actividades complementarias son muy importantes para optimizar nuestro plan formativo, ayudando a despertar el talento y el compañerismo: talleres de cocina, campamentos, desfile de estudiantes, viajes pedagógicos, cultos y enseñanza religiosa, y celebración de días especiales como el día de la familia, el reconocimiento a los maestros y obreros, el día del niño y el día de la juventud.', 'cpp-actividades' ),
			'imagen'   => $img . 'actividad-otras.webp',
			'alt'      => __( 'Estudiantes en el desfile del colegio', 'cpp-actividades' ),
			'ancho'    => '3',
			'posicion' => 'center 30%',
		),
	);

	return apply_filters( 'cpp_actividades_datos', $tarjetas );
}

function cpp_actividades_registrar_assets() {
	wp_register_style( 'cpp-actividades', CPP_ACT_URL . 'assets/layout-grid.css', array(), CPP_ACT_VERSION );
	wp_register_script( 'cpp-actividades', CPP_ACT_URL . 'assets/layout-grid.js', array(), CPP_ACT_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'cpp_actividades_registrar_assets' );

/**
 * Shortcode [cpp_actividades]
 *
 * Atributos (todos opcionales):
 *   ids="12,34,56,78,90"  fotos de la Biblioteca de medios, en el orden de las tarjetas
 *   alto="300"            alto de cada fila de tarjetas en escritorio (px)
 */
function cpp_actividades_shortcode( $atts ) {
	$a = shortcode_atts(
		array(
			'ids'  => '',
			'alto' => '',
		),
		$atts,
		'cpp_actividades'
	);

	$tarjetas = cpp_actividades_datos();

	$ids = array_values( array_filter( array_map( 'absint', explode( ',', $a['ids'] ) ) ) );
	foreach ( $tarjetas as $i => $t ) {
		if ( isset( $ids[ $i ] ) ) {
			$url = wp_get_attachment_image_url( $ids[ $i ], 'large' );
			if ( $url ) {
				$tarjetas[ $i ]['imagen'] = $url;
			}
		}
	}

	$alto = absint( $a['alto'] );

	wp_enqueue_style( 'cpp-actividades' );
	wp_enqueue_script( 'cpp-actividades' );

	ob_start();
	include CPP_ACT_DIR . 'templates/actividades.php';
	return ob_get_clean();
}
add_shortcode( 'cpp_actividades', 'cpp_actividades_shortcode' );
