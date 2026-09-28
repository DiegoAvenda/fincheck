<script>
	import { resolve } from '$app/paths';
</script>

<div class="mt-40 flex flex-col items-center">
	<h1>Sign in</h1>
	<button class="btn w-fit"><a href={resolve('/api/oauth/google')}>Sign in with Google</a></button>
</div>
