import { Dispatch, SetStateAction, useEffect, useLayoutEffect } from 'react';
declare const OneTrust: any;

export const useOneTrustNotice = (
  url: string,
  contentLoaded: boolean,
  setContentLoaded: Dispatch<SetStateAction<boolean>>,
  urlPrefix: string
) => {
  useEffect(() => {
    const noticeApi = OneTrust?.NoticeApi;

    if (noticeApi?.Initialized) {
      noticeApi.Initialized
        .then(() => noticeApi.LoadNotices([url], false))
        .finally(() => {
          setContentLoaded(true);
        });
    }
  }, [url, setContentLoaded]);

  useLayoutEffect(() => {
    if (contentLoaded) {
      const links = document.querySelectorAll('.otnotice-content a');
      links.forEach((l) => {
        const href = l.getAttribute('href');
        if (href?.startsWith('#')) {
          const newHref = `${urlPrefix}${href}`;
          l.setAttribute('href', newHref);
        }
      });

      const sidebar = document.getElementsByClassName('otnotice-menu');
      sidebar[0].setAttribute('style', 'max-height: 65%');
    };
  }, [contentLoaded]);
};
