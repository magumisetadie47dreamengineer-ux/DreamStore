import dns from "dns";

declare global {
  var __dnsConfigured: boolean | undefined;
}

/**
 * Some ISPs/routers fail SRV lookups required by mongodb+srv URIs (querySrv ECONNREFUSED).
 * Use public DNS so Atlas hostnames resolve reliably.
 */
if (!global.__dnsConfigured) {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  global.__dnsConfigured = true;
}
