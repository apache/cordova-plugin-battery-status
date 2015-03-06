using System;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Threading;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Phone.Devices.Power;

namespace BatteryStatus
{
    public sealed class BatteryStatus
    {
        private static Battery battery = Battery.GetDefault();
        private static TaskCompletionSource<string> levelCompletionSource = new TaskCompletionSource<string>();

        public static string start()
        {
            battery.RemainingChargePercentChanged += BatteryOnRemainingChargePercentChanged;

            return getBatteryStatus();
        }

        public static void stop()
        {
            battery.RemainingChargePercentChanged -= BatteryOnRemainingChargePercentChanged;
        }

        public static string getBatteryStatus()
        {
            try
            {
                return Serialize(typeof(BatteryInfo), new BatteryInfo
                {
                    Level = battery.RemainingChargePercent
                });
            }
            catch (Exception ex)
            {
                return Serialize(typeof(ExceptionInfo), new ExceptionInfo { Message = ex.Message });
            }
        }

        public static IAsyncOperation<string> getBatteryStatusChangeEvent()
        {
            return GetBatteryStatusChangeEvent().AsAsyncOperation();
        }

        private static async Task<string> GetBatteryStatusChangeEvent()
        {
            levelCompletionSource = new TaskCompletionSource<string>();

            return await levelCompletionSource.Task;
        }

        private static void BatteryOnRemainingChargePercentChanged(object sender, object o)
        {
            levelCompletionSource.SetResult(getBatteryStatus());
        }

        private static string Serialize(Type type, object obj)
        {
            using (var stream = new MemoryStream())
            {
                var jsonSer = new DataContractJsonSerializer(type);
                jsonSer.WriteObject(stream, obj);
                stream.Position = 0;
                return new StreamReader(stream).ReadToEnd();
            }
        }

        [DataContract]
        private class BatteryInfo
        {
            [DataMember(Name = "level")]
            public int Level;

            // Not supported by native API
            [DataMember(Name = "isPlugged")]
            public string IsPlugged;
        };

        [DataContract]
        private class ExceptionInfo
        {
            [DataMember(Name = "exceptionMessage")]
            public string Message = string.Empty;
        };
    }
}
