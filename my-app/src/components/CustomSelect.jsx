import { useEffect, useRef, useState } from "react";
import "./CustomSelect.css";

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select option",
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setOpen(false);
    };

    return (
        <div className="custom-select" ref={wrapperRef}>
            <button
                type="button"
                className={`custom-select-trigger ${open ? "open" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <span className={`custom-select-arrow ${open ? "rotate" : ""}`}>▾</span>
            </button>

            {open && (
                <div className="custom-select-menu">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            className={`custom-select-option ${value === option.value ? "selected" : ""
                                }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}