<?php
/**
 * Plantilla de las tarjetas de actividades.
 *
 * Variables que recibe: $tarjetas, $alto
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$estilo = $alto ? '--lg-alto:' . $alto . 'px;' : '';
?>
<div class="lg" data-close="<?php echo esc_attr__( 'Cerrar', 'cpp-actividades' ); ?>" style="<?php echo esc_attr( $estilo ); ?>">
	<div class="lg-grid">
		<?php foreach ( $tarjetas as $t ) : ?>
			<?php
			$clase = 'lg-card';
			if ( '2' === $t['ancho'] ) {
				$clase .= ' lg-span-2';
			} elseif ( '3' === $t['ancho'] ) {
				$clase .= ' lg-span-3';
			}
			?>
			<article class="<?php echo esc_attr( $clase ); ?>">
				<button type="button" class="lg-open" aria-haspopup="dialog">
					<img src="<?php echo esc_url( $t['imagen'] ); ?>" alt="<?php echo esc_attr( $t['alt'] ); ?>" loading="lazy" style="object-position:<?php echo esc_attr( $t['posicion'] ); ?>">
					<span class="lg-title"><?php echo esc_html( $t['titulo'] ); ?></span>
					<span class="lg-plus" aria-hidden="true"></span>
				</button>
				<div class="lg-content">
					<h3><?php echo esc_html( $t['titulo'] ); ?></h3>
					<p><?php echo esc_html( $t['texto'] ); ?></p>
				</div>
			</article>
		<?php endforeach; ?>
	</div>
</div>
