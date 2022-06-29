using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CareApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace CareApi.Repository
{
    public class FileRepository : IFileRepository
    {
        private readonly ILogger<FileRepository> _logger;
        private readonly Settings _settings;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private BlobContainerClient _containerClient;

        /// <summary>
        /// Azure Blob storage for file upload
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="client"></param>
        /// <param name="configuration"></param>
        /// <param name="settings"></param>
        public FileRepository(ILogger<FileRepository> logger,
            BlobServiceClient client,
            IConfiguration configuration,
            Settings settings)
        {
            _settings = settings;
            _logger = logger;
            _configuration = configuration;
            _blobServiceClient = client;

            _connectionString = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("APPSETTING_DefaultConnectionstring")) ? _configuration["DefaultConnectionstring"] : Environment.GetEnvironmentVariable("APPSETTING_DefaultConnectionstring");


            Initialize();
        }

        public async Task<string> AddFileAsync(string folder, IFormFile file)
        {
            try
            {
                var blobClient = _containerClient.GetBlobClient($"{folder}/{file.FileName}");
                var result = await blobClient.UploadAsync(file.OpenReadStream());
                return "File has been uploaded";
            }
            catch (RequestFailedException ax)
            {
                return ax.ErrorCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error with AddFile | {folder}");
                return "Internal Server error";
            }
        }

        public async Task<FileResponse> DownloadFileAsync(string folder, string filename)
        {
            try
            {
                CloudBlockBlob blockBlob;
                await using (MemoryStream memoryStream = new MemoryStream())
                {
                    CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(_connectionString);
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference($"attachments");
                    blockBlob = cloudBlobContainer.GetBlockBlobReference($"{folder}/{filename}");
                    await blockBlob.DownloadToStreamAsync(memoryStream);
                }
                Stream blobStream = blockBlob.OpenReadAsync().Result;

                return new FileResponse()
                {
                    FileStream = blobStream,
                    ContentType = blockBlob.Properties.ContentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error with Download File | {folder} {filename}");
                return null;
            }
        }

        public async Task<List<string>> GetFilesAsync(string folder)
        {
            var results = new List<string>();
            try
            {
                var blobClient = _containerClient.GetBlobClient($"{folder}");
                List<string> blobNames = new List<string>();
                var blobHierarchyItems = _containerClient.GetBlobsAsync(BlobTraits.None, BlobStates.None, $"{folder}");
                await foreach (var blobHierarchyItem in blobHierarchyItems)
                {
                    blobNames.Add(blobHierarchyItem.Name);
                }
                return blobNames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error with AddFile | {folder}");
                return null;
            }
        }

        public async Task<string> RemoveFileAsync(string folder, string filename)
        {
            try
            {
                var blobClient = _containerClient.GetBlobClient($"{folder}/{filename}");
                blobClient.DeleteIfExists();
                return "File Removed";
            }
            catch (RequestFailedException ax)
            {
                return ax.ErrorCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error with RemoveFile | {folder}");
                return "Error with Server";
            }
        }

        private void Initialize()
        {
            _containerClient = _blobServiceClient.GetBlobContainerClient("attachments");
            _containerClient.CreateIfNotExists();
        }
    }
    public interface IFileRepository
    {
        public Task<string> AddFileAsync(string folder, IFormFile file);
        public Task<List<string>> GetFilesAsync(string folder);
        public Task<string> RemoveFileAsync(string folder, string filename);
        public Task<FileResponse> DownloadFileAsync(string folder, string filename);
    }

    public class FileResponse
    {
        public Stream FileStream { get; set; }
        public string ContentType { get; set; }
    }
}
