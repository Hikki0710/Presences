const presence = new Presence({
	clientId: "1324806219399036980",
});

const enum Assets {
	Logo = "https://i.imgur.com/V4hlmcx.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
	};

	presence.setActivity(presenceData);
});
