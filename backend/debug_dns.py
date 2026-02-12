
import dns.resolver
import sys

domain = "cluster0.oukof0w.mongodb.net"

try:
    print(f"Resolving SRV for _mongodb._tcp.{domain}")
    answers = dns.resolver.resolve(f"_mongodb._tcp.{domain}", 'SRV')
    for rdata in answers:
        print(f"SRV: {rdata.target} port {rdata.port}")
        
    print(f"\nResolving TXT for {domain}")
    answers = dns.resolver.resolve(domain, 'TXT')
    for rdata in answers:
        print(f"TXT: {rdata}")
        
except Exception as e:
    print(f"DNS Resolution failed: {e}")
