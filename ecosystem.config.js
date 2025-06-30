module.exports = {
    apps: [
        {
            name: "nextas prod",
            script: "npm",
            args: "start",
            env: {
                PORT: 3000,
                NODE_ENV: "production"
            }
        }
    ]
}