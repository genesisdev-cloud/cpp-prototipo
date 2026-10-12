<?php
/**
 * Plantilla del carrusel de niveles.
 *
 * Variables que recibe: $config, $niveles, $altura, $altura_movil
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$estilo = '';
if ( $altura ) {
	$estilo .= '--tgh-altura:' . $altura . 'px;';
}
if ( $altura_movil ) {
	$estilo .= '--tgh-altura-movil:' . $altura_movil . 'px;';
}
?>
<div class="tgh" role="group" aria-label="<?php echo esc_attr( 'Niveles educativos del colegio' ); ?>" data-config="<?php echo esc_attr( wp_json_encode( $config ) ); ?>" style="<?php echo esc_attr( $estilo ); ?>">
	<div class="tgh-band" aria-hidden="true"></div>
</div>

<div class="tgh-niveles">
	<?php foreach ( $niveles as $nivel ) : ?>
		<article>
			<h3><?php echo esc_html( $nivel['etiqueta'] ); ?></h3>
			<?php foreach ( $nivel['lineas'] as $linea ) : ?>
				<p>
					<?php if ( ! empty( $linea[0] ) ) : ?>
						<strong><?php echo esc_html( $linea[0] ); ?>:</strong>
					<?php endif; ?>
					<?php echo esc_html( $linea[1] ); ?>
				</p>
			<?php endforeach; ?>
		</article>
	<?php endforeach; ?>
</div>
