import React, {useState, ReactNode} from 'react';

interface AppExpandedProps {
    title: string;
    isExpanded?: boolean;
    children: ReactNode;
}

export default function AppExpanded({title, isExpanded = true, children}: AppExpandedProps) {
    const [expanded, setExpanded] = useState(isExpanded);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <section>
            <h2
                className="text-lg font-semibold mb-2 flex items-center cursor-pointer"
                onClick={toggleExpanded}
            >
                <span className="mr-2">{expanded ? '▼' : '►'}</span>
                {title}
            </h2>
            {expanded && <div>{children}</div>}
        </section>
    );
}
