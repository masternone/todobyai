# TodoByAI

TodoByAI helps people organize and complete Tasks. Each person signs in through Clerk and has their own Tasks.

## Run locally

Use a Node.js version supported by `package.json`, such as Node 24, and install dependencies with `npm install`. Configure `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env.local` for Clerk sign-in.

```sh
npm run dev
```

## Run with Tailscale

Install [Tailscale](https://tailscale.com/download) on the host computer and each device that needs access. Sign in on the host computer at least once. Enable MagicDNS and [Tailscale Serve](https://tailscale.com/kb/1312/serve) for your Tailscale network when prompted during setup.

```sh
npm run dev:tailscale
```

The script connects Tailscale if it is disconnected, starts TodoByAI on `127.0.0.1:5173`, allows the host computer's specific Tailscale hostname in Vite, and starts a private HTTPS proxy. It prints the address to open on your phone or another computer. Keep Tailscale connected on that device.

Press Ctrl+C to stop TodoByAI and the HTTPS proxy. If the script connected Tailscale, it also disconnects it. If Tailscale was already connected, it stays connected. The host computer must stay awake while others use the app.

The script requires port 5173 to be free and refuses to replace an existing Tailscale Serve configuration. If Node is too old, switch to a supported version first, for example `nvm use 24` if you use nvm.

## Give other people access

Each person uses their own Tailscale account. They do not need your login credentials. Tailscale controls network access; Clerk controls access to TodoByAI and each person's Tasks.

### Invite someone to your Tailscale network

Use this when someone should be a member of your network, also called a tailnet.

1. Open the [Users page](https://login.tailscale.com/admin/users) in the Tailscale admin console.
2. Choose **Invite users** and invite the person as a **Member**. Give administrative roles only to people who need to manage the network.
3. Have them accept the invitation using their own account, install Tailscale, and sign into your network on their device. If they already belong to another network, they may need to switch to yours.
4. Run `npm run dev:tailscale` on the host computer and send them the HTTPS address it prints.
5. Have them open that address and sign into TodoByAI through Clerk with their own account.

Network membership can allow access to other devices and services according to your access rules. Review those rules before inviting someone who only needs TodoByAI.

### Share only the host computer

For someone who only needs TodoByAI, [machine sharing](https://tailscale.com/kb/1084/sharing) lets them access the host computer from their own network.

1. Open the [Machines page](https://login.tailscale.com/admin/machines).
2. Find the computer running TodoByAI, open its menu, and choose **Share**.
3. Create a single-use invitation link and send it privately to the person.
4. Have them accept with their own Tailscale account and connect Tailscale on their device.
5. Send them the full HTTPS address printed by `npm run dev:tailscale`. They use their own Clerk account to sign into TodoByAI.

Sharing applies to the host computer. Tailscale access rules can restrict the recipient to HTTPS port `443` so they can only reach services on that port. Sharing does not give them access to the rest of your network.

### Revoke access

- For network members, remove the person from the **Users** page and review their devices on the **Machines** page.
- For a shared computer, open **Share** on that computer and revoke the person's invitation or share.

Stopping the development script removes TodoByAI's HTTPS proxy for everyone. Restarting it restores access for people whose Tailscale access is still active.
