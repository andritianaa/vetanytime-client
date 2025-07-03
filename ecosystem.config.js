module.exports = {
    apps: [
        {
            name: "Vetanytime prod",
            script: "npm",
            args: "start",
            env: {
                PORT: 3000,
                NODE_ENV: "production"
            }
        }
    ]
}