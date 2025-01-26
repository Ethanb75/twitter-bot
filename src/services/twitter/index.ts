// twitter interface
interface TwitterService {
	authenticate: (something: any) => Promise<any>;
}

const twitterService: TwitterService = {
	authenticate: async (something) => {
		return;
		// return functionFromThisFolder
	}
}

export default twitterService;