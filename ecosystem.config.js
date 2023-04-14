module.exports = {
  apps: [
    {
      name: "next-js-phamthanhnam",
      script: "env-cmd -f .env.production node_modules/next/dist/bin/next",
      args: "start -p 3000", //running on port 3000

      instances: 1,
      watch: false,
    },
  ],
};
