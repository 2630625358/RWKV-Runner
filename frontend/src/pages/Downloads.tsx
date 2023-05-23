import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';
import { observer } from 'mobx-react-lite';
import commonStore from '../stores/commonStore';
import { Divider, Field, ProgressBar } from '@fluentui/react-components';
import { bytesToGb, bytesToKb, bytesToMb, refreshLocalModels } from '../utils';
import { ToolTipButton } from '../components/ToolTipButton';
import { Folder20Regular, Pause20Regular, Play20Regular } from '@fluentui/react-icons';
import { ContinueDownload, OpenFileFolder, PauseDownload } from '../../wailsjs/go/backend_golang/App';

export type DownloadStatus = {
  name: string;
  path: string;
  url: string;
  transferred: number;
  size: number;
  speed: number;
  progress: number;
  downloading: boolean;
  done: boolean;
}

export const Downloads: FC = observer(() => {
  const { t } = useTranslation();
  const finishedModelsLen = commonStore.downloadList.filter((status) => status.done && status.name.endsWith('.pth')).length;
  useEffect(() => {
    if (finishedModelsLen > 0)
      refreshLocalModels({ models: commonStore.modelSourceList }, false);
    console.log('finishedModelsLen:', finishedModelsLen);
  }, [finishedModelsLen]);

  return (
    <Page title={t('Downloads')} content={
      <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden p-1">
        {commonStore.downloadList.slice().reverse().map((status, index) => {
          const downloadProgress = `${status.progress.toFixed(2)}%`;
          const downloadSpeed = `${status.downloading ? bytesToMb(status.speed) : '0'}MB/s`;
          let downloadDetails: string;
          if (status.size < 1024 * 1024)
            downloadDetails = `${bytesToKb(status.transferred) + 'KB'}/${bytesToKb(status.size) + 'KB'}`;
          else if (status.size < 1024 * 1024 * 1024)
            downloadDetails = `${bytesToMb(status.transferred) + 'MB'}/${bytesToMb(status.size) + 'MB'}`;
          else
            downloadDetails = `${bytesToGb(status.transferred) + 'GB'}/${bytesToGb(status.size) + 'GB'}`;

          return <div className="flex flex-col gap-1" key={index}>
            <Field
              label={`${status.downloading ? (t('Downloading') + ': ') : ''}${status.name}`}
              validationMessage={`${downloadProgress} - ${downloadDetails} - ${downloadSpeed} - ${status.url}`}
              validationState={status.done ? 'success' : 'none'}
            >
              <div className="flex items-center gap-2">
                <ProgressBar className="grow" value={status.progress} max={100} />
                {!status.done &&
                  <ToolTipButton desc={status.downloading ? t('Pause') : t('Continue')}
                    icon={status.downloading ? <Pause20Regular /> : <Play20Regular />}
                    onClick={() => {
                      if (status.downloading)
                        PauseDownload(status.url);
                      else
                        ContinueDownload(status.url);
                    }} />}
                <ToolTipButton desc={t('Open Folder')} icon={<Folder20Regular />} onClick={() => {
                  OpenFileFolder(status.path);
                }} />
              </div>
            </Field>
            <Divider style={{ flexGrow: 0 }} />
          </div>;
        })
        }
      </div>
    } />
  );
});