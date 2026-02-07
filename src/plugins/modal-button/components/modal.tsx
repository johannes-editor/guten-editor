/** @jsx h */
import { h } from "@core/jsx";
import { Component } from "@core/components";

interface ModalProps {
    onClose: () => void;
}

export class Modal extends Component<ModalProps> {

    // static styles = /*css*/ `
    //     .guten-modal-backdrop {
    //         position: fixed;
    //         top: 0; left: 0; right: 0; bottom: 0;
    //         background: rgba(0, 0, 0, 0.5);
    //         display: flex;
    //         align-items: center;
    //         justify-content: center;
    //     }

    //     .guten-modal-content {
    //         background: white;
    //         padding: 20px;
    //         border-radius: 8px;
    //         min-width: 300px;
    //     }
    // `;

    render() {
        return (
            <div class="guten-modal-backdrop" onClick={this.props.onClose}>
                <div class="guten-modal-content" onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}>
                    <input type="text" placeholder="Text..." />
                    <br />
                    <button type="button" onClick={this.props.onClose}>Close</button>
                </div>
            </div>
        );
    }
}
