
/**
 * Base class for editor plugins.
 * Implement this to add features to the editor.
 */
export abstract class Plugin {

    /**
    * Initialize the plugin.
    *
    * @param root - Editor root element.
    * @param plugins - All active plugins
    */
    abstract setup(root: HTMLElement, plugins: Plugin[]): void;
}