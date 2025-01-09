const presence = new Presence({
	clientId: "1324806219399036980",
});

const enum Assets {
	Logo = "https://i.imgur.com/V4hlmcx.png",
}

async function getStrings() {
	return presence.getStrings(
		{
			paused: "general.paused",
			play: "general.playing",
			search: "general.searchFor",
			viewCategory: "general.viewCategory",
			viewHome: "general.viewHome",
			viewShow: "general.viewShow",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null,
	current: number,
	duration: number,
	paused: boolean;

presence.on(
	"iFrameData",
	(data: { current: number; duration: number; paused: boolean }) => {
		({ current, duration, paused } = data);
	}
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		[newLang, cover] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("cover"),
		]),
		{ pathname } = document.location;

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	if (
		pathname !== "/" &&
		document.querySelector<HTMLInputElement>("input")?.value
	) {
		presenceData.details = `${strings.search} ${
			document.querySelector<HTMLInputElement>("input")?.value
		}`;
		presenceData.smallImageKey = Assets.Search;
		presence.setActivity(presenceData);
		return;
	}

	if (pathname.startsWith("/homepage")) presenceData.details = strings.viewHome;
	else if (pathname.startsWith("/drama")) {
		presenceData.smallImageKey = Assets.Viewing;
		presenceData.smallImageText = strings.viewShow;
		presenceData.largeImageKey = cover
			? document.querySelector<HTMLImageElement>(".anime-image > img")?.src ??
			  Assets.Logo
			: Assets.Logo;
		presenceData.details = `${strings.viewShow} ${document
			.querySelector("h2")
			.textContent.replace(/\s/g, "")}`;
	} else if (pathname.startsWith("/watch")) {
		presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play;
		presenceData.smallImageText = paused ? strings.paused : strings.play;
		presenceData.largeImageKey = cover
			? document.querySelector<HTMLImageElement>(".anime-featured > img")
					?.src ?? Assets.Logo
			: Assets.Logo;
		presenceData.details = `${strings.play} ${
			document.querySelector(".anime-data > h4 > a").textContent
		}`;
		presenceData.state = document.querySelector(".current-episode")
			? `Episode: ${document
					.querySelector(".current-episode > .episode-list-item-number")
					.textContent.replace(/\s/g, "")}`
			: "movie";
		if (!isNaN(duration) && !paused) {
			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestamps(current, duration);
		}
	}

	presence.setActivity(presenceData);
});
