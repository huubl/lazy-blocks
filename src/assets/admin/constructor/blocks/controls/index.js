import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import classnames from 'classnames/dedupe';

import './editor.scss';
import Control from './control';

const { __ } = wp.i18n;

const {
    Component,
    Fragment,
    createRef,
} = wp.element;

const {
    Tooltip,
    TabPanel,
} = wp.components;

const { compose } = wp.compose;

const {
    withDispatch,
    dispatch,
} = wp.data;

const $ = window.jQuery;

const constructorData = window.lazyblocksConstructorData;

const DragHandle = SortableHandle( () => (
    <span className="lzb-constructor-controls-item-handler">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6.99L9 14L11 14L11 6.99L14 6.99L10 3L6 6.99L9 6.99Z" fill="currentColor" />
            <path d="M15 18.01L15 11L13 11L13 18.01L10 18.01L14 22L18 18.01L15 18.01Z" fill="currentColor" />
        </svg>
    </span>
) );

const SortableItem = SortableElement( ( data ) => (
    <Control
        { ...{
            ...data,
            ...{
                DragHandle,
            },
        } }
    />
) );
const SortableList = SortableContainer( ( { items } ) => (
    <div className="lzb-constructor-controls-items-sortable">
        { items.map( ( value, index ) => (
            <SortableItem
                key={ `lzb-constructor-controls-items-sortable-${ value.id }` }
                index={ index }
                { ...value }
            />
        ) ) }
    </div>
) );

let initialActiveTab = '';

class ControlsSettings extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            // eslint-disable-next-line react/no-unused-state
            placement: 'content',
            // eslint-disable-next-line react/no-unused-state
            collapsedId: '',
        };

        this.sortRef = createRef();

        this.printControls = this.printControls.bind( this );
    }

    componentDidMount() {
        // fix first loading focus on code editor
        $( '.lazyblocks-control-tabs button:eq(0)' ).focus();
    }

    printControls( childOf = '', placement = '' ) {
        const self = this;
        const {
            data,
            addControl,
            removeControl,
            resortControl,
            updateControlData,
        } = self.props;

        const {
            controls = {},
        } = data;

        const items = [];

        Object.keys( controls ).forEach( ( id ) => {
            const controlData = controls[ id ];
            const collapsed = self.state.collapsedId === id;
            const controlPlacement = controlData.placement || 'content';

            if ( childOf !== controlData.child_of ) {
                return;
            }

            if ( ! controlData.child_of && placement !== controlPlacement && 'both' !== controlPlacement ) {
                return;
            }

            items.push( {
                addControl( newControlData, resortId ) {
                    addControl( newControlData, resortId );
                },
                removeControl( optionalId = false ) {
                    removeControl( optionalId || id );
                },
                updateData( newData, optionalId = false ) {
                    updateControlData( optionalId || id, newData );
                },
                printControls: self.printControls,
                data: controlData,
                id,
                controls,
                collapsed,
            } );
        } );

        return (
            <Fragment>
                <SortableList
                    ref={ self.sortRef }
                    items={ items }
                    onSortEnd={ ( { oldIndex, newIndex } ) => {
                        resortControl( items[ oldIndex ].id, items[ newIndex ].id );
                    } }
                    useDragHandle
                    helperClass="lzb-constructor-controls-item-dragging"
                    helperContainer={ () => {
                        if ( self.sortRef && self.sortRef.current && self.sortRef.current.container ) {
                            return self.sortRef.current.container;
                        }

                        // sometimes container ref disappears, so we can find dom element manually.
                        const newRef = document.querySelector( '.lzb-constructor' ) || document.body;

                        return newRef;
                    } }
                />
                <Tooltip text={ childOf ? __( 'Add Child Control', '@@text_domain' ) : __( 'Add Control', '@@text_domain' ) }>
                    { /* eslint-disable-next-line react/button-has-type */ }
                    <button
                        className="lzb-constructor-controls-item-appender"
                        onClick={ () => {
                            addControl( {
                                placement: placement || 'content',
                                child_of: childOf,
                            } );
                        } }
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" /></svg>
                    </button>
                </Tooltip>
            </Fragment>
        );
    }

    render() {
        const self = this;
        const {
            data,
        } = self.props;

        const {
            controls = {},
        } = data;

        const placementTabs = [
            {
                name: 'content',
                title: __( 'Content', '@@text_domain' ),
                className: 'lazyblocks-control-tabs-tab',
            }, {
                name: 'inspector',
                title: __( 'Inspector', '@@text_domain' ),
                className: 'lazyblocks-control-tabs-tab',
            },
        ];

        // Check if there is hidden controls
        let thereIsHidden = false;

        Object.keys( controls ).forEach( ( id ) => {
            const controlData = controls[ id ];

            if ( ! controlData.child_of && 'nowhere' === controlData.placement ) {
                thereIsHidden = true;
            }
        } );

        placementTabs.push( {
            name: 'nowhere',
            title: __( 'Hidden', '@@text_domain' ),
            className: classnames( 'lazyblocks-control-tabs-tab', ! thereIsHidden ? 'lazyblocks-control-tabs-tab-hidden' : '' ),
        } );

        // set initial active tab.
        if ( ! initialActiveTab ) {
            initialActiveTab = 'content';
            let contentControlsCount = 0;
            let inspectorControlsCount = 0;
            let nowhereControlsCount = 0;

            Object.keys( controls ).forEach( ( id ) => {
                const controlData = controls[ id ];

                switch ( controlData.placement ) {
                case 'content':
                    contentControlsCount += 1;
                    break;
                case 'inspector':
                    inspectorControlsCount += 1;
                    break;
                case 'nowhere':
                    nowhereControlsCount += 1;
                    break;
                // no default
                }
            } );

            if ( ! contentControlsCount ) {
                if ( inspectorControlsCount ) {
                    initialActiveTab = 'inspector';
                } else if ( nowhereControlsCount ) {
                    initialActiveTab = 'nowhere';
                }
            }
        }

        return (
            <div className="lzb-constructor-controls">
                <TabPanel
                    className="lazyblocks-control-tabs"
                    activeClass="is-active"
                    initialTabName={ initialActiveTab }
                    tabs={ placementTabs }
                >
                    {
                        ( tab ) => self.printControls( '', tab.name )
                    }
                </TabPanel>
            </div>
        );
    }
}

export default compose( [
    withDispatch( () => {
        const {
            addControl,
            removeControl,
            resortControl,
            updateControlData,
        } = dispatch( 'lazy-blocks/block-data' );

        return {
            addControl( attributes, resortId ) {
                addControl( {
                    ...constructorData.controls.text.attributes,
                    ...attributes,
                }, resortId );
            },
            removeControl,
            resortControl,
            updateControlData,
        };
    } ),
] )( ControlsSettings );
