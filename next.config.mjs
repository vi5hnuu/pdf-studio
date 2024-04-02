/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
};

export default nextConfig;
