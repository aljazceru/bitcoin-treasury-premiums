#!/bin/sh
set -e

echo "🔧 Setting up Bitcoin Treasury Tracker..."

# Ensure directories exist
mkdir -p /app/data /app/logs

# Fix ownership and permissions
chown -R nextjs:nodejs /app/data /app/logs 2>/dev/null || true
chmod 755 /app/data /app/logs 2>/dev/null || true

# Create database file if it doesn't exist
if [ ! -f /app/data/treasury.db ]; then
    touch /app/data/treasury.db
    chown nextjs:nodejs /app/data/treasury.db 2>/dev/null || true
fi

chmod 664 /app/data/treasury.db 2>/dev/null || true

echo "✅ Permissions setup complete"

# Switch to nextjs user and start the application
echo "🚀 Starting Bitcoin Treasury Tracker as nextjs user..."
exec su-exec nextjs npm start