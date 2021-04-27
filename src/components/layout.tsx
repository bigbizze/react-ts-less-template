import * as React from "react";
import { PropsWithChildren } from "../shared_types";
import "../styles/layout.less";

interface Layout extends PropsWithChildren {}

const Layout = ({ children }: Layout) => (
    <>
        <header>
            <h1>header</h1>
        </header>
        <div className="left-sidebar">left</div>
        <main>
            {children}
        </main>

        <div className="right-sidebar">right</div>
        <footer>footer</footer>
    </>
);

export default Layout;
