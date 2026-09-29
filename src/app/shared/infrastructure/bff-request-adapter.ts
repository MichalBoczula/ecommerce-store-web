import { AnonymousAuthenticationProvider } from '@microsoft/kiota-abstractions';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { environment } from '../../../environments/environment';

export function createBffRequestAdapter(): FetchRequestAdapter {
    const adapter = new FetchRequestAdapter(new AnonymousAuthenticationProvider());
    adapter.baseUrl = environment.bffBasePath;
    return adapter;
}
