
import React from 'react';
import { Render } from "@measured/puck";
import { config } from "../config/puck.config";

interface WebRendererProps {
    data: any;
}

const WebRenderer: React.FC<WebRendererProps> = ({ data }) => {
    if (!data || !data.content) {
        return null;
    }

    return (
        <div className="puck-renderer">
            <Render config={config} data={data} />
        </div>
    );
};

export default WebRenderer;
