/** @jsx h */
import { h } from '../../../jsx.ts';
import { Component } from "../../../components/component.ts";
import { DefaultProps } from "../../../components/types.ts";
import { Modal } from "./modal.tsx";

interface ModalButtonUIState {
    open: boolean;
}

export class ModalButtonUI extends Component<DefaultProps, ModalButtonUIState> {

    toggleModal = () => {
        this.setState({ open: !this.state.open });
    };

    override onMount(): void {
        this.setState({ open: false });
    }

    render() {
        return (
            <div>
                <button type="button" onClick={this.toggleModal}>Abrir Modal</button>
                {this.state.open && <Modal onClose={this.toggleModal} />}
            </div>
        );
    }
}