module.exports = {
  apps: [
    {
      name: "role-droid",
      script: "./src/index.ts",
      interpreter: "bun",
      node_args: "--smol" 
    }
  ]
};