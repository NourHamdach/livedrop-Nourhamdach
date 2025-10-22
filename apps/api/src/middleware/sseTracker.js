let activeSSEConnections = 0;

/**
 * Middleware to prepare SSE connection headers and
 * track connection lifecycle. Must be used before SSE routes.
 */
export function sseSetup(req, res, next) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  activeSSEConnections++;
  console.log(`🟢 New SSE connection (${activeSSEConnections} active)`);

  res.on("close", () => {
    activeSSEConnections = Math.max(0, activeSSEConnections - 1);
    console.log(`🔴 SSE connection closed (${activeSSEConnections} active)`);
  });

  // Attach helper for convenience
  res.sendSSE = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Don’t call next() automatically for true streams.
  // Let the route call next() only if it’s not streaming.
  next();
}

export function getActiveSSECount() {
  return activeSSEConnections;
}
