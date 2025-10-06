
module.exports = {
    theme: {
        fontFamily: {
            sans: ['futura-pt', 'Helvetica', 'sans-serif'],
            serif: ['futura-pt', 'Helvetica', 'sans-serif']
        }
    },
    safelist: [
        // simple classes
        "hover:bg-[#fff]",
        "hover:bg-[#000]",
        "text-center",
        "hover:[&>aside]:opacity-100",

        // or use patterns with regex-like syntax
        {
            pattern: /bg-(red|green|blue)-(100|200|300)/,
        },
        {
            pattern: /^hover:/, // keep any hover: classes
            variants: ["md", "lg"], // optional: restrict which variants
        },
    ],
}