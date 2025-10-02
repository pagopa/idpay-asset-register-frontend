import { Dispatch, SetStateAction, useEffect, useLayoutEffect } from 'react';
declare const OneTrust: any;

export const useOneTrustNotice = (
  url: string,
  contentLoaded: boolean,
  setContentLoaded: Dispatch<SetStateAction<boolean>>,
  urlPrefix: string
) => {
  useEffect(() => {
    OneTrust.NoticeApi.Initialized.then(function () {
      OneTrust.NoticeApi.LoadNotices([url], false);
    }).finally(() => {
      setContentLoaded(true);
    });
  }, []);

  useLayoutEffect(() => {
    setTimeout(() => {
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
    }, 1000);
  }, [contentLoaded]);
};
