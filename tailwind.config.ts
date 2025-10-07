
module.exports = {
    theme: {
        fontFamily: {
            sans: ['futura-pt', 'Helvetica', 'sans-serif'],
            serif: ['futura-pt', 'Helvetica', 'sans-serif']
        }
    },
    safelist: [
        // simple classes
        "hover:text-[#fff]",
        "hover:text-[#000]",
        "hover:bg-[#fff]",
        "hover:bg-[#000]",
        "text-center",
        "hover:[&>aside]:opacity-100",
        "hover:fill-[#fff]",
        "hover:fill-[#000]",
        "hover:[&>svg]:fill-[#fff]",
        "hover:[&>svg]:fill-[#000]",
        "[&>svg]:fill-[#fff]",
        "[&>svg]:fill-[#000]",
        "border-[#fff]",
        "border-[#000]",
        "text-[#fff]",
        "text-[#000]",
        "bg-[#fff]",
        "bg-[#000]",

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