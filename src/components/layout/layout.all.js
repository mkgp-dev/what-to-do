import Content from "./content";
import Sidebar from "./sidebar";

export default function Layout() {
    const frag = document.createDocumentFragment();

    const container = document.createElement('div');
    container.className = 'flex';

    const content = document.createElement('div');
    content.classList.add('flex', 'flex-1', 'min-w-0');

    Sidebar.create().mount(container);
    Content.create().mount(content);

    container.appendChild(content);
    frag.appendChild(container);

    return frag;
}