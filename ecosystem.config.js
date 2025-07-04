module.exports = {
    apps: [
        {
            name: "Vetanytime client",
            script: "npm",
            args: "start",
            env: {
                PORT: 3042,
                NODE_ENV: "production"
            }
        }
    ]
}