/*
 * Gutenberg control https://github.com/WordPress/gutenberg/blob/master/packages/components/src/color-palette/
 * Added `disableAlpha` prop
 */
import classnames from 'classnames';

const { map } = window.lodash;

const { __, sprintf } = wp.i18n;

const {
    Button,
    Dropdown,
    Tooltip,
    ColorPicker,
    Dashicon,
} = wp.components;

export default function ColorPalette( {
    colors, disableAlpha = true, disableCustomColors = false, value, onChange, className,
} ) {
    function applyOrUnset( color ) {
        return () => onChange( value === color ? undefined : color );
    }
    const customColorPickerLabel = __( 'Custom color picker', '@@text_domain' );
    const classes = classnames( 'components-color-palette', className );
    return (
        <div className={ classes }>
            { map( colors, ( { color, name } ) => {
                const style = { color };
                const itemClasses = classnames( 'components-color-palette__item components-circular-option-picker__option', { 'is-active': value === color } );

                return (
                    <div key={ color } className="components-color-palette__item-wrapper components-circular-option-picker__option-wrapper">
                        <Tooltip
                            text={ name
                                // translators: %s: color hex code e.g: "#f00".
                                || sprintf( __( 'Color code: %s', '@@text_domain' ), color ) }
                        >
                            <button
                                type="button"
                                className={ itemClasses }
                                style={ style }
                                onClick={ applyOrUnset( color ) }
                                aria-label={ name
                                    // translators: %s: The name of the color e.g: "vivid red".
                                    ? sprintf( __( 'Color: %s', '@@text_domain' ), name )
                                    // translators: %s: color hex code e.g: "#f00".
                                    : sprintf( __( 'Color code: %s', '@@text_domain' ), color ) }
                                aria-pressed={ value === color }
                            />
                        </Tooltip>
                        { value === color && <Dashicon icon="saved" /> }
                    </div>
                );
            } ) }

            <div className="components-color-palette__custom-clear-wrapper">
                { ! disableCustomColors
                    && (
                        <Dropdown
                            className="components-color-palette__custom-color"
                            contentClassName="components-color-palette__picker"
                            renderToggle={ ( { isOpen, onToggle } ) => (
                                <Button
                                    aria-expanded={ isOpen }
                                    onClick={ onToggle }
                                    aria-label={ customColorPickerLabel }
                                    isLink
                                >
                                    { __( 'Custom Color', '@@text_domain' ) }
                                </Button>
                            ) }
                            renderContent={ () => (
                                <ColorPicker
                                    color={ value }
                                    onChangeComplete={ ( color ) => {
                                        let colorString;

                                        if ( 'undefined' === typeof color.rgb || 1 === color.rgb.a ) {
                                            colorString = color.hex;
                                        } else {
                                            const {
                                                r, g, b, a,
                                            } = color.rgb;
                                            colorString = `rgba(${ r }, ${ g }, ${ b }, ${ a })`;
                                        }

                                        onChange( colorString );
                                    } }
                                    disableAlpha={ disableAlpha }
                                />
                            ) }
                        />
                    ) }

                <Button
                    className="components-color-palette__clear"
                    type="button"
                    onClick={ () => onChange( undefined ) }
                    isSmall
                    isSecondary
                >
                    { __( 'Clear', '@@text_domain' ) }
                </Button>
            </div>
        </div>
    );
}
