using CareApi.Models;
using CareApi.Repository;
using CareApi.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using Microsoft.Extensions.Azure;
using Azure.Storage.Queues;
using Azure.Storage.Blobs;
using Azure.Core.Extensions;
using Azure.Data.Tables;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using CareApi.Middleware;
using EchoBot1;
using Microsoft.Bot.Builder;
using System.Collections.Concurrent;
using Microsoft.Bot.Schema;

namespace CareApi
{
    public class Startup
    {
        private readonly IWebHostEnvironment _env;
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            _env = env;
        }

        public IConfiguration Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var builder = new ConfigurationBuilder()
               .SetBasePath(_env.ContentRootPath)
               .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
               .AddJsonFile($"appsettings.{_env.EnvironmentName}.json", optional: true)
               .AddEnvironmentVariables();

            Configuration = builder.Build();

            //Get Configuration
            Settings settings = Configuration.GetSection("Settings").Get<Settings>();

            //Add Settings
            services.AddSingleton<Settings>(settings);

            services.AddHttpClient("WebClient", client => client.Timeout = TimeSpan.FromSeconds(600));
            services.AddHttpContextAccessor();

            services.AddControllers();
            services.AddSwaggerGen();

            //Dependancy Injection
            services.AddSingleton<ICaseService, CaseService>();
            services.AddSingleton<ITicketService, TicketService>();
            services.AddSingleton<ITownService, TownService>();
            services.AddSingleton<ITicketCategoryService, TicketCategoryService>();
            services.AddSingleton<IConversationService, ConversationService>();

            services.AddSingleton<IActionRepository, ActionRepository>();
            services.AddSingleton<ICaseRepository, CaseRepository>();
            services.AddSingleton<ITicketRepository, TicketRepository>();
            services.AddSingleton<IConversationRepository, ConversationRepository>();
            services.AddSingleton<IFileRepository, FileRepository>();
            services.AddSingleton<ITownRepository, TownRepository>();
            services.AddSingleton<ITicketCategoryRepository, TicketCategoryRepository>();
            services.AddSingleton(Configuration);

            string connectionString = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("APPSETTING_DefaultConnectionstring")) ? Configuration["DefaultConnectionstring"] : Environment.GetEnvironmentVariable("APPSETTING_DefaultConnectionstring");
            services.AddAzureClients(builder =>
            {
                builder.AddTableServiceClient(connectionString, preferMsi: true);
                builder.AddBlobServiceClient(connectionString, preferMsi: true);
                builder.AddQueueServiceClient(connectionString, preferMsi: true);
            });

            // Create the Bot Framework Authentication to be used with the Bot Adapter.
            services.AddSingleton<BotFrameworkAuthentication, ConfigurationBotFrameworkAuthentication>();

            // Create the Bot Adapter with error handling enabled.
            services.AddSingleton<IBotFrameworkHttpAdapter, AdapterWithErrorHandler>();

            // Create a global hashset for our ConversationReferences
            services.AddSingleton<ConcurrentDictionary<string, ConversationReference>>();

            // Create the bot as a transient. In this case the ASP Controller is expecting an IBot.
            services.AddTransient<IBot, EchoBot1.Bots.EchoBot>();
            // bot services
            services.AddSingleton<IBotMessagingExtensionQueryService, BotMessagingExtensionQueryService>();
            services.AddSingleton<IFAQService, FAQService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseMiddleware<AuthenticationMiddleware>();
            }

            app.UseHttpsRedirection();

            app.UseRouting();
            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(origin => true));

            app.UseAuthorization();
            

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
    internal static class StartupExtensions
    {

        public static IAzureClientBuilder<TableServiceClient, TableClientOptions> AddTableServiceClient(this AzureClientFactoryBuilder builder, string serviceUriOrConnectionString, bool preferMsi)
        {
            if (preferMsi && Uri.TryCreate(serviceUriOrConnectionString, UriKind.Absolute, out Uri serviceUri))
            {
                return builder.AddTableServiceClient(serviceUri);
            }
            else
            {
                return builder.AddTableServiceClient(serviceUriOrConnectionString);
            }
        }

        public static IAzureClientBuilder<BlobServiceClient, BlobClientOptions> AddBlobServiceClient(this AzureClientFactoryBuilder builder, string serviceUriOrConnectionString, bool preferMsi)
        {
            if (preferMsi && Uri.TryCreate(serviceUriOrConnectionString, UriKind.Absolute, out Uri serviceUri))
            {
                return builder.AddBlobServiceClient(serviceUri);
            }
            else
            {
                return builder.AddBlobServiceClient(serviceUriOrConnectionString);
            }
        }
        public static IAzureClientBuilder<QueueServiceClient, QueueClientOptions> AddQueueServiceClient(this AzureClientFactoryBuilder builder, string serviceUriOrConnectionString, bool preferMsi)
        {
            if (preferMsi && Uri.TryCreate(serviceUriOrConnectionString, UriKind.Absolute, out Uri serviceUri))
            {
                return builder.AddQueueServiceClient(serviceUri);
            }
            else
            {
                return builder.AddQueueServiceClient(serviceUriOrConnectionString);
            }
        }
    }
}
