module.exports = {
  apps: [
    {
      name: "next-js-phamthanhnam",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      watch: ["src"],
      ignore_watch: ["node_modules"],
      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};
