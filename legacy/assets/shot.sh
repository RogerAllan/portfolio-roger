#!/bin/sh
# derive host gateway from container IP (no `ip` needed)
ip=$(hostname -i 2>/dev/null | awk '{print $1}')
gw=$(echo "$ip" | sed 's/\.[0-9]*$/.1/')
echo "container=$ip gateway=$gw"
mkdir -p /tmp/loc
for pair in "$@"; do
  p=${pair%%:*}; n=${pair##*:}
  if playwright screenshot --viewport-size=1440,900 --wait-for-timeout=5000 "http://$gw:$p" "/tmp/loc/$n.jpg" >/dev/null 2>&1; then
    echo "OK $n ($p) $(stat -c%s /tmp/loc/$n.jpg)"
  else
    echo "FAIL $n ($p)"
  fi
done
