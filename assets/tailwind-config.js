/* Shared Tailwind (CDN) config — loaded by every page right after the Tailwind
   CDN script. Tokens come from DESIGN.md; change them here, once. */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "error": "#ba1a1a",
                "on-secondary-container": "#fffbff",
                "surface-container-low": "#f3f3f3",
                "on-surface": "#1b1b1b",
                "on-secondary-fixed-variant": "#93000c",
                "surface": "#f9f9f9",
                "inverse-surface": "#303030",
                "outline-variant": "#c4c5d9",
                "inverse-on-surface": "#f1f1f1",
                "surface-variant": "#e2e2e2",
                "tertiary-fixed": "#ffe16d",
                "on-tertiary-container": "#4c3e00",
                "on-secondary": "#ffffff",
                "surface-tint": "#124af0",
                "on-error-container": "#93000a",
                "tertiary-fixed-dim": "#e9c400",
                "on-primary-fixed-variant": "#0035be",
                "error-container": "#ffdad6",
                "primary": "#0040e0",
                "secondary-container": "#e51a22",
                "on-surface-variant": "#434656",
                "surface-container-high": "#e8e8e8",
                "on-background": "#1b1b1b",
                "on-error": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "primary-fixed": "#dde1ff",
                "secondary-fixed-dim": "#ffb4ab",
                "inverse-primary": "#b8c3ff",
                "secondary-fixed": "#ffdad6",
                "surface-dim": "#dadada",
                "background": "#f9f9f9",
                "surface-container-highest": "#e2e2e2",
                "primary-fixed-dim": "#b8c3ff",
                "on-secondary-fixed": "#410002",
                "on-primary-container": "#efefff",
                "on-primary": "#ffffff",
                "tertiary-container": "#c9a900",
                "secondary": "#bb0013",
                "surface-container": "#eeeeee",
                "outline": "#747688",
                "on-primary-fixed": "#001356",
                "on-tertiary-fixed": "#221b00",
                "on-tertiary-fixed-variant": "#544600",
                "on-tertiary": "#ffffff",
                "primary-container": "#2e5bff",
                "tertiary": "#705d00",
                "surface-bright": "#f9f9f9"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "offset-shadow": "8px",
                "panel-margin": "24px",
                "gutter": "16px",
                "stroke-width": "4px"
            },
            fontFamily: {
                "headline-sm": ["Anybody", "sans-serif"],
                "headline-lg": ["Anybody", "sans-serif"],
                "headline-lg-mobile": ["Anybody", "sans-serif"],
                "headline-md": ["Anybody", "sans-serif"],
                "body-lg": ["Work Sans", "sans-serif"],
                "body-md": ["Work Sans", "sans-serif"],
                "label-bold": ["Space Grotesk", "sans-serif"]
            },
            fontSize: {
                "headline-sm": ["32px", {"lineHeight": "1.2", "fontWeight": "800"}],
                "headline-lg": ["72px", {"lineHeight": "1.0", "letterSpacing": "-0.02em", "fontWeight": "900"}],
                "headline-lg-mobile": ["48px", {"lineHeight": "1.0", "fontWeight": "900"}],
                "headline-md": ["48px", {"lineHeight": "1.1", "fontWeight": "800"}],
                "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                "label-bold": ["14px", {"lineHeight": "1.2", "fontWeight": "700"}]
            }
        }
    }
};
