FROM node:18-alpine AS production

# Argument for port, can be overridden at build time or runtime
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG PORT=3000
ENV PORT=${PORT}

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) for runtime dependencies
COPY package*.json ./

# Install only production dependencies
# If you use yarn, replace with:
# COPY yarn.lock ./
# RUN yarn install --production --frozen-lockfile
RUN npm install --omit=dev --ignore-scripts
# We run --ignore-scripts because postinstall scripts (like prisma generate)
# might not be needed or might fail if devDependencies are not present.
# Prisma client should already be generated and copied from the builder stage.


# Copy built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy Prisma schema and generated client from the builder stage
# The generated client is crucial for runtime.
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/.env ./.env # Copy .env file - ensure it's configured for production
                                           # Or better: manage environment variables outside the image (e.g., Docker Compose, K8s ConfigMaps/Secrets)

# The Prisma client is typically located within node_modules/@prisma/client,
# so copying node_modules from the builder *should* include it if `npx prisma generate`
# was run before `npm install --omit=dev` in the builder stage or if `@prisma/client` is a prod dependency.
# If it's a devDependency, ensure it's copied explicitly or made a prod dep.
# The `COPY --from=builder /usr/src/app/node_modules ./node_modules` should cover this.

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run the application
# The main.js file in the dist folder is the entry point for the built application.
CMD ["node", "dist/main.js"]